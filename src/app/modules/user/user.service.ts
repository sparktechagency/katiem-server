import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IUser, IUserFilterableFields } from './user.interface'
import { User } from './user.model'

import { USER_ROLES, USER_STATUS } from '../../../enum/user'

import { JwtPayload } from 'jsonwebtoken'
import { logger } from '../../../shared/logger'
import { ImageUploadPayload } from '../../../interfaces/shared'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { user_searchable_fields } from './user.constants'
import { paginationHelper } from '../../../helpers/paginationHelper'
import removeFile from '../../../helpers/image/remove'
import { Chat } from '../chat/chat.model'
import { Booking } from '../booking/booking.model'
import { BOOKING_STATUS } from '../../../enum/status'
import { Review } from '../review/review.model'

type UpdateProfile = IUser & {
  latitude?: number
  longitude?: number
}

const updateProfile = async (user: JwtPayload, payload: Partial<UpdateProfile>) => {
  if (
    typeof payload.latitude === 'number' &&
    typeof payload.longitude === 'number'
  ) {
    payload.location = {
      type: 'Point',
      coordinates: [payload.longitude, payload.latitude], // lng, lat
    }
  }

  const updatedProfile = await User.findOneAndUpdate(
    { _id: user.authId, status: { $nin: [USER_STATUS.DELETED] } },
    {
      $set: payload,
    },
    { new: false },
  )

  if (!updatedProfile) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update profile.')
  }

  return 'Profile updated successfully.'
}

const createAdmin = async (): Promise<Partial<IUser> | null> => {
  const admin = {
    email: 'hcf@gmail.com',
    name: 'Andrea',
    password: '12345678',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    verified: true,
    authentication: {
      oneTimeCode: null,
      restrictionLeftAt: null,
      expiresAt: null,
      latestRequestAt: new Date(),
      authType: '',
    },
  }

  const isAdminExist = await User.findOne({
    email: admin.email,
    status: { $nin: [USER_STATUS.DELETED] },
  })

  if (isAdminExist) {
    logger.log('info', 'Admin account already exist, skipping creation.🦥')
    return isAdminExist
  }
  const result = await User.create([admin])
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin')
  }
  return result[0]
}

const getWorkers = async (
  user: JwtPayload,
  filters: IUserFilterableFields,
  paginationOptions: IPaginationOptions,
) => {
  const {
    searchTerm,
    minSalary,
    maxSalary,
    minRating,
    maxRating,
    latitude,
    longitude,
    radius,
    ...filterData
  } = filters
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions)
  const andConditions: any[] = []

  // Role and status conditions
  andConditions.push({
    role: USER_ROLES.WORKER,
    status: { $nin: [USER_STATUS.DELETED] },
  })

  // Salary range filtering
  if (minSalary !== undefined || maxSalary !== undefined) {
    const salaryCondition: any = {}
    if (minSalary !== undefined && minSalary !== null) {
      salaryCondition['$gte'] = Number(minSalary)
    }
    if (maxSalary !== undefined && maxSalary !== null) {
      salaryCondition['$lte'] = Number(maxSalary)
    }

    if (Object.keys(salaryCondition).length > 0) {
      andConditions.push({ salary: salaryCondition })
    }
  }

  // Rating range filtering
  if (minRating !== undefined || maxRating !== undefined) {
    const ratingCondition: any = {}
    if (minRating !== undefined && minRating !== null) {
      ratingCondition['$gte'] = Number(minRating)
    }
    if (maxRating !== undefined && maxRating !== null) {
      ratingCondition['$lte'] = Number(maxRating)
    }

    if (Object.keys(ratingCondition).length > 0) {
      andConditions.push({ rating: ratingCondition })
    }
  }

  // Geospatial filtering logic
  let searchLatitude = latitude
  let searchLongitude = longitude
  let searchRadius = radius

  // If no coordinates provided by frontend, fallback to user profile location
  if (searchLatitude === undefined || searchLongitude === undefined) {
    const currentUser = await User.findById(user.authId).select('location').lean()
    if (currentUser?.location?.coordinates) {
      searchLongitude = searchLongitude ?? currentUser.location.coordinates[0]
      searchLatitude = searchLatitude ?? currentUser.location.coordinates[1]
    }
  }

  // If we have coordinates (either from frontend or profile), apply the filter
  if (searchLatitude !== undefined && searchLongitude !== undefined) {
    andConditions.push({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(searchLongitude), Number(searchLatitude)],
          },
          $maxDistance: (Number(searchRadius) || 100) * 1000,
        },
      },
    })
  }

  // Search term filtering
  if (searchTerm) {
    andConditions.push({
      $or: user_searchable_fields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  // Other filterable fields
  const filteredEntries = Object.entries(filterData).filter(
    ([_, value]) => value !== undefined && value !== null && value !== ''
  )

  if (filteredEntries.length > 0) {
    andConditions.push({
      $and: filteredEntries.map(([key, value]) => ({
        [key]: value,
      })),
    })
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {}

  const [result, total] = await Promise.all([
    User.find(whereConditions)
      .select(
        '-nidFront -nidBack -email -phone -verified -status -appId -deviceToken -nid -availableJobQuota -availableBoostQuota -availableBookingQuota',
      )
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(whereConditions),
  ])

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  }
}

const getUserProfile = async (user: JwtPayload) => {
  const isUserExist = await User.findById(user.authId).lean()
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The requested user not found.')
  }
  return isUserExist
}

const uploadImages = async (user: JwtPayload, payload: ImageUploadPayload) => {
  const { authId } = user
  const userExist = await User.findById(authId)
  if (!userExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The requested user not found.')
  }
  const { images, type } = payload
  if (type === 'cover') {
    userExist.cover = images[0]
  } else if (type === 'nidFront') {
    userExist.nidFront = images[0]
  } else if (type === 'nidBack') {
    userExist.nidBack = images[0]
  } else if (type === 'profile') {
    userExist.profile = images[0]
  }
  const updatedUser = await User.findByIdAndUpdate(authId, userExist, {
    new: false,
  })
  if (!updatedUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Failed to upload ${type} image. Please try again.`,
    )
  }

  if (updatedUser && (updatedUser as any)[type]) {
    await removeFile((updatedUser as any)[type])
  }

  return 'Images uploaded successfully.'
}

const getSingleWorker = async (user: JwtPayload, workerId: string) => {
  const worker = await User.findById(workerId)
    .select('-nidFront -nidBack')
    .lean()
  if (!worker) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The requested worker not found.')
  }

  if (user.role === USER_ROLES.EMPLOYER) {
    const [chat, booking, isReviewExist] = await Promise.all([
      Chat.findOne({
        participants: { $all: [user.authId, worker._id] }
      }),
      Booking.findOne({
        worker: worker._id,
        employer: user.authId,
        status: BOOKING_STATUS.APPROVED
      }),
      Review.exists({
        $or: [
          {
            reviewee: worker._id,
            reviewer: user.authId
          },
          {
            reviewee: user.authId,
            reviewer: worker._id
          }
        ]
      })
    ])

    worker.isBooked = !!booking
    worker.bookingStatus = booking ? booking.status : ""
    worker.chatId = chat ? chat._id : ""
    worker.isReviewed = !!isReviewExist


  }

  return worker
}

const deleteUser = async (userId: string) => {
  const userExist = await User.findById(userId)
  if (!userExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'The requested user not found.')
  }
  const updatedUser = await User.findByIdAndUpdate(userId, { status: USER_STATUS.DELETED }, {
    new: false,
  })
  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete user.')
  }
  return 'User deleted successfully.'
}

export const UserServices = {
  updateProfile,
  createAdmin,
  uploadImages,
  getWorkers,
  getUserProfile,
  getSingleWorker,
  deleteUser
}

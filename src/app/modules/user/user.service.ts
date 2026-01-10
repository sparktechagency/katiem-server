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
  // console.log(first)

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
  const andConditions = []

  if (minSalary || maxSalary) {
    andConditions.push({
      salary: {
        $gte: Number(minSalary) || 0,
        $lte: Number(maxSalary) || Number.MAX_SAFE_INTEGER,
      },
    })
  }
  if (minRating || maxRating) {
    andConditions.push({
      rating: {
        $gte: Number(minRating) || 0,
        $lte: Number(maxRating) || Number.MAX_SAFE_INTEGER,
      },
    })
  }
  if (latitude && longitude && radius) {
    andConditions.push({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude) || 0, Number(latitude) || 0],
          },
          $maxDistance: Number(radius) || 10000, //10km max
        },
      },
    })
  }

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

  const sanitizedFilterData = Object.fromEntries(
    Object.entries(filterData).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
    )
  );


  if (Object.keys(sanitizedFilterData).length) {
    andConditions.push({
      $and: Object.entries(sanitizedFilterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  andConditions.push({
    role: USER_ROLES.WORKER,
  })
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

  if (updatedUser[type]) {
    await removeFile(updatedUser[type])
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

export const UserServices = {
  updateProfile,
  createAdmin,
  uploadImages,
  getWorkers,
  getUserProfile,
  getSingleWorker,
}

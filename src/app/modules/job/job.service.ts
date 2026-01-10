import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IJobFilterables, IJob } from './job.interface'
import { Job } from './job.model'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { jobSearchableFields } from './job.constants'
import mongoose, { Types } from 'mongoose'
import { Application } from '../application/application.model'
import { IUser } from '../user/user.interface'
import { User } from '../user/user.model'
import { Chat } from '../chat/chat.model'
import { USER_ROLES } from '../../../enum/user'
import { APPLICATION_STATUS } from '../../../enum/status'
import { Review } from '../review/review.model'
import { consumeQuota, validateQuota } from '../subscription/subscription.utils'

type CreateJobPayload = IJob & {
  latitude?: number
  longitude?: number
}

const createJob = async (userPayload: JwtPayload, payload: CreateJobPayload) => {

  if (
    typeof payload.latitude === 'number' &&
    typeof payload.longitude === 'number'
  ) {
    payload.location = {
      type: 'Point',
      coordinates: [payload.longitude, payload.latitude], // lng, lat
    }
  }

  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const user = await User.findById(userPayload.authId).session(session)
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.')

    //TODO sensisitve area

    const isUnlimited = await validateQuota(user, 'job')
    payload.createdBy = user._id

    const job = await Job.create([payload], { session })
    await consumeQuota(user._id, 'job', isUnlimited, session)

    await session.commitTransaction()
    // return '🎉 Job created successfully!'
    return isUnlimited
      ? '🎉 Job created successfully! You have unlimited job creation access.'
      : `🎉 Job created successfully! Remaining job creation quota: ${user.availableJobQuota! - 1}.`
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const getAllJobs = async (
  filterables: IJobFilterables,
  pagination: IPaginationOptions,
) => {
  const {
    searchTerm,
    minSalary,
    maxSalary,
    latitude,
    longitude,
    minRating,
    maxRating,
    radius,
    ...filterData
  } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const andConditions = []

  if (minRating || maxRating) {
    andConditions.push({
      rating: {
        $gte: minRating || 0,
        $lte: maxRating || Number.MAX_SAFE_INTEGER,
      },
    })
  }

  if (minSalary || maxSalary) {
    andConditions.push({
      salary: {
        $gte: Number(minSalary) || 0,
        $lte: Number(maxSalary) || Number.MAX_SAFE_INTEGER,
      },
    })
  }

  if (latitude && longitude && radius) {
    andConditions.push({
      address: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(radius) || 10000, // 10km radius
        },
      },
    })
  }

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: jobSearchableFields.map(field => ({
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

  // Filter functionality
  if (Object.keys(sanitizedFilterData).length) {
    andConditions.push({
      $and: Object.entries(sanitizedFilterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }


  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  const [result, total] = await Promise.all([
    Job.find(whereConditions)
      .populate('createdBy')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .lean(),
    Job.countDocuments(whereConditions),
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

const getSingleJob = async (user: JwtPayload, id: string): Promise<IJob> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Job ID')
  }

  const result = await Job.findById(id).populate('createdBy').lean()
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested job not found, please try again with valid id',
    )
  }

  if (user.role === USER_ROLES.WORKER) {
    const [chat, application, isReviewExist] = await Promise.all([
      Chat.findOne({
        participants: { $all: [user.authId, result.createdBy] }
      }),
      Application.findOne({
        applicant: user.authId,
        job: result._id
      }),
      Review.findOne({
        $or: [
          {
            reviewee: result.createdBy,
            reviewer: user.authId
          },
          {
            reviewee: user.authId,
            reviewer: result.createdBy
          }
        ]
      })
    ])



    result.isApplied = !!application
    result.applicationStatus = application ? application?.status : ""
    result.isReviewed = !!isReviewExist



    result.chatId = chat ? chat._id : ""

  }



  return result
}

const updateJob = async (
  user: JwtPayload,
  id: string,
  payload: Partial<CreateJobPayload>,
): Promise<string | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Job ID')
  }


  if (
    typeof payload.latitude === 'number' &&
    typeof payload.longitude === 'number'
  ) {
    payload.location = {
      type: 'Point',
      coordinates: [payload.longitude, payload.latitude], // lng, lat
    }
  }

  const result = await Job.findOneAndUpdate(
    { _id: new Types.ObjectId(id), createdBy: new Types.ObjectId(user.authId) },
    { $set: payload },
    {
      new: true,
      runValidators: true,
    },
  )

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested job not found, please try again with valid id.',
    )
  }

  return 'Job has been updated successfully.'
}

const deleteJob = async (user: JwtPayload, id: string): Promise<string> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Job ID')
  }

  const isApplicationExist = await Application.countDocuments({
    job: new Types.ObjectId(id),
  })

  if (isApplicationExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You can not delete this job, because it has been applied by some users.',
    )
  }

  const result = await Job.findOneAndDelete({
    _id: new Types.ObjectId(id),
    createdBy: new Types.ObjectId(user.authId),
  })

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting job, please try again with valid id.',
    )
  }

  return 'Job has been deleted successfully.'
}

const applyJob = async (user: JwtPayload, jobId: string): Promise<string> => {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Job ID')
  }

  const result = await Job.findByIdAndUpdate(
    new Types.ObjectId(jobId),
    { $push: { applicants: new Types.ObjectId(user.authId) } },
    {
      new: true,
      runValidators: true,
    },
  ).lean()

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested job not found, please try again with valid id',
    )
  }

  return 'Job has been applied successfully.'
}

const getMyPostedJobs = async (
  user: JwtPayload,
  filterables: IJobFilterables,
  pagination: IPaginationOptions,
) => {
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const { searchTerm, ...filterData } = filterables

  const andConditions = []

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: jobSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    })
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    })
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  const [result, total] = await Promise.all([
    Job.find({
      createdAtBy: new Types.ObjectId(user.authId),
      ...whereConditions,
    })
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }),
    Job.countDocuments({
      createdAtBy: new Types.ObjectId(user.authId),
      ...whereConditions,
    }),
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

const boostAJob = async (user: JwtPayload, jobId: string) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const job = await Job.findById(jobId)
      .populate<{ createdBy: IUser }>('createdBy')
      .session(session)

    if (!job) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Job not found.')
    }

    const owner = job.createdBy
    if (owner._id.toString() !== user.authId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Only the job owner can boost this job.',
      )
    }

    //TODO sensisitve area

    const isUnlimited = await validateQuota(owner, 'boost')
    await consumeQuota(owner._id, 'boost', isUnlimited, session)

    await Job.findByIdAndUpdate(
      job._id,
      { $set: { isBoosted: true } },
      { session },
    )

    await session.commitTransaction()
    return '🚀 Job boosted successfully!'
    return isUnlimited
      ? '🚀 Job boosted successfully! You have unlimited boosts.'
      : `🚀 Job boosted successfully! Remaining boosts: ${owner.availableBoostQuota! - 1}.`
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

export const JobServices = {
  createJob,
  getAllJobs,
  getSingleJob,
  updateJob,
  deleteJob,
  applyJob,
  getMyPostedJobs,
  boostAJob,
}

import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import {
  IApplication,
  IApplicationCreate,
  IApplicationFilterables,
} from './application.interface'
import { Application } from './application.model'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { applicationSearchableFields } from './application.constants'
import mongoose, { Types } from 'mongoose'
import { Job } from '../job/job.model'
import { APPLICATION_STATUS } from '../../../enum/status'
import { IUser } from '../user/user.interface'
import {
  getNotificationMessage,
  hideUserSensitiveInformation,
} from '../../../utils/common.functions'
import { sendNotification } from '../../../helpers/notificationHelper'
import { IJob } from '../job/job.interface'
import { User } from '../user/user.model'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { ChatServices } from '../chat/chat.service'
import { logger } from '../../../shared/logger'
import { emitEvent } from '../../../helpers/socketInstances'
import { Chat } from '../chat/chat.model'

const createApplication = async (
  user: JwtPayload,
  jobId: string,
): Promise<string> => {
  console.log(user, jobId)

  const userId = new Types.ObjectId(user.authId)
  const jobObjectId = new Types.ObjectId(jobId)

  console.log(userId, jobObjectId)

  const [getRequestedUser, isJobExist, isAlreadyApplied] = await Promise.all([
    User.findById(userId).select('isAccountVerified status').lean(),
    Job.findById({
      _id: jobObjectId,
    }),
    Application.exists({
      applicant: userId,
      job: jobObjectId,
    }),
  ])

  if (isAlreadyApplied) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have already applied for this job. Please check your applications to see the status of your application.',
    )
  }

  if (!isJobExist) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'The job you are applying for does not exist. Please check the job ID and try again.',
    )
  }

  if (!getRequestedUser) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Sorry something went wrong getting your profile information. Please try again.',
    )
  }

  const { isAccountVerified, status } = getRequestedUser

  if (status === USER_STATUS.DELETED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deleted. Please contact the admin to resolve the issue.',
    )
  }

  if (status === USER_STATUS.RESTRICTED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account is restricted. Please contact the admin to resolve the issue.',
    )
  }

  if (!isAccountVerified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account is not verified. Please verify your account to apply for jobs.',
    )
  }

  if (isJobExist.isExpired) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'The job you are applying for has expired. Please apply for a new job.',
    )
  }

  const payload: IApplicationCreate = {
    applicant: new Types.ObjectId(user.authId),
    job: isJobExist._id,
    employer: isJobExist.createdBy,
  }

  const result = await Application.create(payload)
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create Application, please try again with valid data.',
    )
  }

  //send notificaiton to the job poster
  const notificationData = {
    from: {
      authId: user.authId,
      name: user.name,
      profile: user.profile,
    },
    to: isJobExist.createdBy.toString(),
    title: getNotificationMessage(user, 'application', isJobExist),
    body: getNotificationMessage(user, 'application', isJobExist),
  }

  await sendNotification(
    notificationData.from,
    notificationData.to,
    notificationData.title,
    notificationData.body,
  )

  return `Application has been created successfully.`
}

const getAllApplications = async (
  user: JwtPayload,
  filterables: IApplicationFilterables,
  pagination: IPaginationOptions,
  jobId: string,
) => {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide a valid Job ID')
  }
  const { searchTerm, ...filterData } = filterables
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)



  const andConditions = []

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: applicationSearchableFields.map(field => ({
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

  andConditions.push({
    $or: [
      { employer: new Types.ObjectId(user.authId) },
      { applicant: new Types.ObjectId(user.authId) },
    ],
  })
  andConditions.push({
    job: new Types.ObjectId(jobId),
  })

  const whereConditions = andConditions.length ? { $and: andConditions } : {}

  const [result, total] = await Promise.all([
    Application.find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate('job')
      .populate<{ employer: IUser }>('employer')
      .populate<{ applicant: IUser }>('applicant')
      .lean(),
    Application.countDocuments(whereConditions),
  ])

  //only include phone and email field if the application status is approved
  result.forEach(item => {
    if (item.status !== APPLICATION_STATUS.APPROVED) {
      hideUserSensitiveInformation(item)
    }
  })

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

const getSingleApplication = async (
  user: JwtPayload,
  id: string,
): Promise<IApplication> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please provide a valid Application ID',
    )
  }

  const result = await Application.findById(id)
    .populate('job')
    .populate<{ employer: IUser }>('employer')
    .populate<{ applicant: IUser }>('applicant')
    .lean()

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested application not found, please try again with valid id',
    )
  }

  const ownerId =
    user.role === USER_ROLES.EMPLOYER
      ? result.employer._id
      : result.applicant._id

  if (!ownerId.equals(user.authId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to access this application',
    )
  }

  if (result.status !== APPLICATION_STATUS.APPROVED) {
    hideUserSensitiveInformation(result)
  }




  return result
}

const updateApplication = async (
  user: JwtPayload,
  id: string,
  payload: Pick<IApplication, 'status'>,
): Promise<string | null> => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const employerObjectId = new Types.ObjectId(user.authId)



    const application = await Application.findOneAndUpdate(
      {
        applicant: new Types.ObjectId(id),
        employer: employerObjectId,
        status: APPLICATION_STATUS.PENDING,
      },
      payload,
      { new: true, runValidators: true, session },
    )
      .populate<{ employer: IUser }>('employer')
      .populate<{ applicant: IUser }>('applicant')
      .populate<{ job: IJob }>('job')
      .lean()



    console.log(application, '😒😒😒 application')


    if (!application) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Something went wrong while updating application, please try again with valid application that you have applied.',
      )
    }

    //TODO check whether the application is related to the user trying to update applicaiton status. 


    let createdChat: any = null

    //if status is approved then create a chat between employer and applicant
    if (application.status === APPLICATION_STATUS.APPROVED) {
      createdChat = await ChatServices.createChatBySystem(
        application.employer._id,
        application.applicant._id,
        session,
      )
    }

    await session.commitTransaction()

    console.log(createdChat, '😂😂😂😂 chat')


    if (createdChat?.newChat) {
      for (const participant of createdChat.participants) {
        emitEvent(`newChat::${participant}`, createdChat.formattedChat)
      }
    }

    //send notificaiton to the job poster
    const notificationData = {
      from: {
        authId: user.authId,
        name: user.name,
        profile: user.profile,
      },
      to: application.applicant._id.toString(),
      title: getNotificationMessage(
        user,
        'application',
        application.job as IJob,
        application.status,
      ),
      body: getNotificationMessage(
        user,
        'application',
        application.job as IJob,
        application.status,
      ),
    }

    await sendNotification(
      notificationData.from,
      notificationData.to,
      notificationData.title,
      notificationData.body,
    )

    return `Application has been ${payload.status} successfully.`
  } catch (error: any) {
    await session.abortTransaction()

    if (error instanceof ApiError) throw error

    logger.error(error)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update application, please try again.',
    )
  } finally {
    await session.endSession()
  }
}

const deleteApplication = async (
  user: JwtPayload,
  id: string,
): Promise<string> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Application ID')
  }
  const deleteCondition = {
    _id: new Types.ObjectId(id),
    applicant: new Types.ObjectId(user.authId),
  }
  const result = await Application.findByIdAndDelete(deleteCondition)
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting application, please try again with valid application that you have applied.',
    )
  }

  return `Application has been deleted successfully.`
}

const getApplicationListForWorker = async (user: JwtPayload) => {
  const applications = await Application.find({ applicant: user.authId })
    .select(' -applicant -createdAt -updatedAt -__v')
    .lean()
  return applications || []
}

const getApplicationListForWorkerWithDetails = async (user: JwtPayload) => {
  const applications = await Application.find({ applicant: user.authId })
    .populate('employer')
    .populate('job')
    .select(' -applicant -createdAt -updatedAt -__v')
    .lean()
  return applications || []
}

export const ApplicationServices = {
  createApplication,
  getAllApplications,
  getSingleApplication,
  updateApplication,
  deleteApplication,
  getApplicationListForWorker,
  getApplicationListForWorkerWithDetails
}

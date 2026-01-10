import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { Booking } from './booking.model'
import { JwtPayload } from 'jsonwebtoken'
import { IPaginationOptions } from '../../../interfaces/pagination'
import { paginationHelper } from '../../../helpers/paginationHelper'
import mongoose, { Types } from 'mongoose'
import { IBooking, IBookingCreate } from './booking.interface'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { BOOKING_STATUS } from '../../../enum/status'
import {
  getNotificationMessage,
  hideUserSensitiveInformation,
} from '../../../utils/common.functions'
import { sendNotification } from '../../../helpers/notificationHelper'
import { IUser } from '../user/user.interface'
import { User } from '../user/user.model'
import { consumeQuota, validateQuota } from '../subscription/subscription.utils'
import { logger } from '../../../shared/logger'
import { emitEvent } from '../../../helpers/socketInstances'
import { ChatServices } from '../chat/chat.service'

// const createBooking = async (
//   user: JwtPayload,
//   payload: IBookingCreate
// ): Promise<string> => {

//   //Check if the user is already in the booking list for the requested user
//   const [isAlreadyBooked, isUserExist] = await Promise.all([
//     Booking.exists({
//       employer: new Types.ObjectId(user.authId),
//       worker: new Types.ObjectId(payload.worker),
//       status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] },
//     }),
//     User.findById(new Types.ObjectId(payload.worker)).select('isAccountVerified status').lean(),
//   ]);

//   if (!isUserExist) {
//     throw new ApiError(
//       StatusCodes.NOT_FOUND,
//       'The user you are booking with does not exist. Please check the user ID and try again.'
//     );
//   }

//   if (isUserExist.status === USER_STATUS.RESTRICTED) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'The user you are booking with is restricted. Please contact them through other means.'
//     );
//   }

//   if (isUserExist.status !== USER_STATUS.ACTIVE) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'The user you are booking with is not active. Please contact them through other means.'
//     );
//   }

//   if (isAlreadyBooked) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'You already have a booking request with this user, please contact the user through inbox.'
//     );
//   }

//   payload.employer = new Types.ObjectId(user.authId);
//   const result = await Booking.create(payload);
//   if (!result) {
//     throw new ApiError(
//       StatusCodes.BAD_REQUEST,
//       'Failed to create Booking, please try again with valid data.'
//     );
//   }

//   //send notification to the worker
//   const notificationPayload = {
//     from: {
//       authId: user.authId,
//       name: user.name,
//       profile: user.profile,
//     },
//     to: payload.worker.toString(),
//     title: getNotificationMessage(user, "booking"),
//     body: getNotificationMessage(user, "booking")
//   };

//   await sendNotification(notificationPayload.from, notificationPayload.to, notificationPayload.title, notificationPayload.body);
//   return `Booking has been created successfully.`;

// };

export const createBooking = async (
  user: JwtPayload,
  requestedTo: string,
): Promise<string> => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    const requestedToObjectId = new Types.ObjectId(requestedTo)

    // Check if the worker exists and get status
    const worker = await User.findById(requestedToObjectId)
      .select('isAccountVerified status subscription availableBookingQuota')
      .session(session)
      .lean()

    if (!worker) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'The user you are booking with does not exist. Please check the user ID and try again.',
      )
    }

    if (worker.status === USER_STATUS.RESTRICTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The user you are booking with is restricted. Please contact them through other means.',
      )
    }

    if (worker.status !== USER_STATUS.ACTIVE) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'The user you are booking with is not active. Please contact them through other means.',
      )
    }

    // Check if already booked
    const isAlreadyBooked = await Booking.exists({
      employer: new Types.ObjectId(user.authId),
      worker: new Types.ObjectId(requestedTo),
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] },
    })

    if (isAlreadyBooked) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'You already have a booking request with this user, please contact the user through inbox.',
      )
    }

    // Fetch employer with subscription to check quota
    const employer = await User.findById(user.authId)
      .select('subscription availableBookingQuota')
      .session(session)
      .lean()

    if (!employer) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.')
    }
    //TODO sensisitve area

    // Validate booking quota using the utility
    const isUnlimited = await validateQuota(employer, 'booking')


    // Create booking
    const result = await Booking.create([{
      worker: requestedToObjectId,
      employer: user.authId
    }], { session })
    if (!result || !result.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create booking, please try again with valid data.',
      )
    }
    //TODO sensisitve area

    // Consume quota if limited
    await consumeQuota(employer._id, 'booking', isUnlimited, session)

    // Send notification to the worker
    const notificationPayload = {
      from: {
        authId: user.authId,
        name: user.name,
        profile: user.profile,
      },
      to: requestedTo,
      title: getNotificationMessage(user, 'booking'),
      body: getNotificationMessage(user, 'booking'),
    }

    await sendNotification(
      notificationPayload.from,
      notificationPayload.to,
      notificationPayload.title,
      notificationPayload.body,
    )

    await session.commitTransaction()

    return isUnlimited
      ? 'Booking has been created successfully! You have unlimited bookings remaining.'
      : `Booking has been created successfully! Remaining booking quota: ${employer.availableBookingQuota! - 1
      }.`
    // return 'Booking has been created successfully!'
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    await session.endSession()
  }
}

const getAllBookings = async (
  user: JwtPayload,
  pagination: IPaginationOptions,
) => {
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelper.calculatePagination(pagination)

  const query = {
    ...(user.role === USER_ROLES.WORKER
      ? { worker: new Types.ObjectId(user.authId) }
      : { employer: new Types.ObjectId(user.authId) }),
  }

  const [result, total] = await Promise.all([
    Booking.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .populate<{ employer: IUser }>('employer')
      .populate<{ worker: IUser }>('worker')
      .lean(),
    Booking.countDocuments(query),
  ])

  result.forEach(booking => {
    if (booking.status !== BOOKING_STATUS.APPROVED) {
      hideUserSensitiveInformation(booking)
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

const getSingleBooking = async (
  user: JwtPayload,
  id: string,
): Promise<IBooking> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Booking ID')
  }

  const result = await Booking.findById(id)
    .populate<{ employer: IUser }>('employer')
    .populate<{ worker: IUser }>('worker')
    .lean()
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested booking not found, please try again with valid id',
    )
  }

  const requestedBy = result.employer?._id
  const requestedTo = result.worker?._id

  if (!requestedBy.equals(user.authId) && !requestedTo.equals(user.authId)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to access this booking, please try again with valid id',
    )
  }

  if (result.status !== BOOKING_STATUS.APPROVED) {
    hideUserSensitiveInformation(result)
  }



  return result
}

const updateBooking = async (
  user: JwtPayload,
  id: string,
  payload: Pick<IBooking, 'status'>,
): Promise<string> => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const bookingId = new Types.ObjectId(id)
    const userId = new Types.ObjectId(user.authId)
    console.log(payload)
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        worker: userId,
        status: BOOKING_STATUS.PENDING,
      },
      { $set: payload },
      {
        new: true,
        runValidators: true,
        session,
      },
    )
      .populate<{ employer: IUser }>('employer')
      .populate<{ worker: IUser }>('worker')
      .lean()

    console.log(booking)

    if (!booking) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Booking not found or already processed',
      )
    }

    let createdChat: any = null

    // ✅ Create chat only when booking is approved
    if (booking.status === BOOKING_STATUS.APPROVED) {
      createdChat = await ChatServices.createChatBySystem(
        booking.employer._id,
        booking.worker._id,
        session,
      )
    }

    await session.commitTransaction()

    if (createdChat?.newChat) {
      for (const participant of createdChat.participants) {
        emitEvent(`newChat::${participant}`, createdChat.formattedChat)
      }
    }


    const notificationPayload = {
      from: {
        authId: user.authId,
        name: user.name,
        profile: user.profile,
      },
      to: booking.employer._id.toString(),
      title: getNotificationMessage(user, 'booking', undefined, booking.status),
      body: getNotificationMessage(user, 'booking', undefined, booking.status),
    }

    try {
      await sendNotification(
        notificationPayload.from,
        notificationPayload.to,
        notificationPayload.title,
        notificationPayload.body,
      )
    } catch (err) {
      logger.warn('Booking notification failed', err)
    }

    return `Booking has been ${booking.status} successfully.`
  } catch (error: any) {
    await session.abortTransaction()

    if (error instanceof ApiError) throw error

    logger.error(error)
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to update booking, please try again.',
    )
  } finally {
    await session.endSession()
  }
}

const deleteBooking = async (user: JwtPayload, id: string): Promise<string> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Booking ID')
  }

  const result = await Booking.findOneAndDelete({
    _id: new Types.ObjectId(id),
    employer: new Types.ObjectId(user.authId),
  })
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting booking, please try again with valid id.',
    )
  }

  return `Booking has been deleted successfully.`
}

export const BookingServices = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  updateBooking,
  deleteBooking,
}

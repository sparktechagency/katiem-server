"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingServices = exports.createBooking = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const booking_model_1 = require("./booking.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const mongoose_1 = __importStar(require("mongoose"));
const user_1 = require("../../../enum/user");
const status_1 = require("../../../enum/status");
const common_functions_1 = require("../../../utils/common.functions");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const user_model_1 = require("../user/user.model");
const subscription_utils_1 = require("../subscription/subscription.utils");
const logger_1 = require("../../../shared/logger");
const socketInstances_1 = require("../../../helpers/socketInstances");
const chat_service_1 = require("../chat/chat.service");
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
const createBooking = async (user, requestedTo) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const requestedToObjectId = new mongoose_1.Types.ObjectId(requestedTo);
        // Check if the worker exists and get status
        const worker = await user_model_1.User.findById(requestedToObjectId)
            .select('isAccountVerified status subscription availableBookingQuota')
            .session(session)
            .lean();
        if (!worker) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'The user you are booking with does not exist. Please check the user ID and try again.');
        }
        if (worker.status === user_1.USER_STATUS.RESTRICTED) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The user you are booking with is restricted. Please contact them through other means.');
        }
        if (worker.status !== user_1.USER_STATUS.ACTIVE) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The user you are booking with is not active. Please contact them through other means.');
        }
        // Check if already booked
        const isAlreadyBooked = await booking_model_1.Booking.exists({
            employer: new mongoose_1.Types.ObjectId(user.authId),
            worker: new mongoose_1.Types.ObjectId(requestedTo),
            status: { $in: [status_1.BOOKING_STATUS.PENDING, status_1.BOOKING_STATUS.APPROVED] },
        });
        if (isAlreadyBooked) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You already have a booking request with this user, please contact the user through inbox.');
        }
        // Fetch employer with subscription to check quota
        const employer = await user_model_1.User.findById(user.authId)
            .select('subscription availableBookingQuota')
            .session(session)
            .lean();
        if (!employer) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
        }
        //TODO sensisitve area
        // Validate booking quota using the utility
        const isUnlimited = await (0, subscription_utils_1.validateQuota)(employer, 'booking');
        // Create booking
        const result = await booking_model_1.Booking.create([{
                worker: requestedToObjectId,
                employer: user.authId
            }], { session });
        if (!result || !result.length) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create booking, please try again with valid data.');
        }
        //TODO sensisitve area
        // Consume quota if limited
        await (0, subscription_utils_1.consumeQuota)(employer._id, 'booking', isUnlimited, session);
        // Send notification to the worker
        const notificationPayload = {
            from: {
                authId: user.authId,
                name: user.name,
                profile: user.profile,
            },
            to: requestedTo,
            title: (0, common_functions_1.getNotificationMessage)(user, 'booking'),
            body: (0, common_functions_1.getNotificationMessage)(user, 'booking'),
        };
        await (0, notificationHelper_1.sendNotification)(notificationPayload.from, notificationPayload.to, notificationPayload.title, notificationPayload.body);
        await session.commitTransaction();
        return isUnlimited
            ? 'Booking has been created successfully! You have unlimited bookings remaining.'
            : `Booking has been created successfully! Remaining booking quota: ${employer.availableBookingQuota - 1}.`;
        // return 'Booking has been created successfully!'
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
};
exports.createBooking = createBooking;
const getAllBookings = async (user, pagination) => {
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const query = {
        ...(user.role === user_1.USER_ROLES.WORKER
            ? { worker: new mongoose_1.Types.ObjectId(user.authId) }
            : { employer: new mongoose_1.Types.ObjectId(user.authId) }),
    };
    const [result, total] = await Promise.all([
        booking_model_1.Booking.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate('employer')
            .populate('worker')
            .lean(),
        booking_model_1.Booking.countDocuments(query),
    ]);
    result.forEach(booking => {
        if (booking.status !== status_1.BOOKING_STATUS.APPROVED) {
            (0, common_functions_1.hideUserSensitiveInformation)(booking);
        }
    });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
const getSingleBooking = async (user, id) => {
    var _a, _b;
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Booking ID');
    }
    const result = await booking_model_1.Booking.findById(id)
        .populate('employer')
        .populate('worker')
        .lean();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested booking not found, please try again with valid id');
    }
    const requestedBy = (_a = result.employer) === null || _a === void 0 ? void 0 : _a._id;
    const requestedTo = (_b = result.worker) === null || _b === void 0 ? void 0 : _b._id;
    if (!requestedBy.equals(user.authId) && !requestedTo.equals(user.authId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to access this booking, please try again with valid id');
    }
    if (result.status !== status_1.BOOKING_STATUS.APPROVED) {
        (0, common_functions_1.hideUserSensitiveInformation)(result);
    }
    return result;
};
const updateBooking = async (user, id, payload) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const bookingId = new mongoose_1.Types.ObjectId(id);
        const userId = new mongoose_1.Types.ObjectId(user.authId);
        console.log(payload);
        const booking = await booking_model_1.Booking.findOneAndUpdate({
            _id: bookingId,
            worker: userId,
            status: status_1.BOOKING_STATUS.PENDING,
        }, { $set: payload }, {
            new: true,
            runValidators: true,
            session,
        })
            .populate('employer')
            .populate('worker')
            .lean();
        console.log(booking);
        if (!booking) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Booking not found or already processed');
        }
        let createdChat = null;
        // ✅ Create chat only when booking is approved
        if (booking.status === status_1.BOOKING_STATUS.APPROVED) {
            createdChat = await chat_service_1.ChatServices.createChatBySystem(booking.employer._id, booking.worker._id, session);
        }
        await session.commitTransaction();
        if (createdChat === null || createdChat === void 0 ? void 0 : createdChat.newChat) {
            for (const participant of createdChat.participants) {
                (0, socketInstances_1.emitEvent)(`newChat::${participant}`, createdChat.formattedChat);
            }
        }
        const notificationPayload = {
            from: {
                authId: user.authId,
                name: user.name,
                profile: user.profile,
            },
            to: booking.employer._id.toString(),
            title: (0, common_functions_1.getNotificationMessage)(user, 'booking', undefined, booking.status),
            body: (0, common_functions_1.getNotificationMessage)(user, 'booking', undefined, booking.status),
        };
        try {
            await (0, notificationHelper_1.sendNotification)(notificationPayload.from, notificationPayload.to, notificationPayload.title, notificationPayload.body);
        }
        catch (err) {
            logger_1.logger.warn('Booking notification failed', err);
        }
        return `Booking has been ${booking.status} successfully.`;
    }
    catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError_1.default)
            throw error;
        logger_1.logger.error(error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update booking, please try again.');
    }
    finally {
        await session.endSession();
    }
};
const deleteBooking = async (user, id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Booking ID');
    }
    const result = await booking_model_1.Booking.findOneAndDelete({
        _id: new mongoose_1.Types.ObjectId(id),
        employer: new mongoose_1.Types.ObjectId(user.authId),
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting booking, please try again with valid id.');
    }
    return `Booking has been deleted successfully.`;
};
exports.BookingServices = {
    createBooking: exports.createBooking,
    getAllBookings,
    getSingleBooking,
    updateBooking,
    deleteBooking,
};

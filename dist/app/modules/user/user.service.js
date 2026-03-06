"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("./user.model");
const user_1 = require("../../../enum/user");
const logger_1 = require("../../../shared/logger");
const user_constants_1 = require("./user.constants");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const remove_1 = __importDefault(require("../../../helpers/image/remove"));
const chat_model_1 = require("../chat/chat.model");
const booking_model_1 = require("../booking/booking.model");
const status_1 = require("../../../enum/status");
const review_model_1 = require("../review/review.model");
const updateProfile = async (user, payload) => {
    if (typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number') {
        payload.location = {
            type: 'Point',
            coordinates: [payload.longitude, payload.latitude], // lng, lat
        };
    }
    const updatedProfile = await user_model_1.User.findOneAndUpdate({ _id: user.authId, status: { $nin: [user_1.USER_STATUS.DELETED] } }, {
        $set: payload,
    }, { new: false });
    if (!updatedProfile) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update profile.');
    }
    return 'Profile updated successfully.';
};
const createAdmin = async () => {
    const admin = {
        email: 'hcf@gmail.com',
        name: 'Andrea',
        password: '12345678',
        role: user_1.USER_ROLES.ADMIN,
        status: user_1.USER_STATUS.ACTIVE,
        verified: true,
        authentication: {
            oneTimeCode: null,
            restrictionLeftAt: null,
            expiresAt: null,
            latestRequestAt: new Date(),
            authType: '',
        },
    };
    const isAdminExist = await user_model_1.User.findOne({
        email: admin.email,
        status: { $nin: [user_1.USER_STATUS.DELETED] },
    });
    if (isAdminExist) {
        logger_1.logger.log('info', 'Admin account already exist, skipping creation.🦥');
        return isAdminExist;
    }
    const result = await user_model_1.User.create([admin]);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create admin');
    }
    return result[0];
};
const getWorkers = async (user, filters, paginationOptions) => {
    const { searchTerm, minSalary, maxSalary, minRating, maxRating, latitude, longitude, radius, ...filterData } = filters;
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const andConditions = [];
    if (minSalary || maxSalary) {
        andConditions.push({
            salary: {
                $gte: Number(minSalary) || 0,
                $lte: Number(maxSalary) || Number.MAX_SAFE_INTEGER,
            },
        });
    }
    if (minRating || maxRating) {
        andConditions.push({
            rating: {
                $gte: Number(minRating) || 0,
                $lte: Number(maxRating) || Number.MAX_SAFE_INTEGER,
            },
        });
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
        });
    }
    if (searchTerm) {
        andConditions.push({
            $or: user_constants_1.user_searchable_fields.map(field => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }
    const sanitizedFilterData = Object.fromEntries(Object.entries(filterData).filter(([_, value]) => value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)));
    if (Object.keys(sanitizedFilterData).length) {
        andConditions.push({
            $and: Object.entries(sanitizedFilterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    andConditions.push({
        role: user_1.USER_ROLES.WORKER,
    });
    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        user_model_1.User.find(whereConditions)
            .select('-nidFront -nidBack -email -phone -verified -status -appId -deviceToken -nid -availableJobQuota -availableBoostQuota -availableBookingQuota')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit),
        user_model_1.User.countDocuments(whereConditions),
    ]);
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
const getUserProfile = async (user) => {
    const isUserExist = await user_model_1.User.findById(user.authId).lean();
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'The requested user not found.');
    }
    return isUserExist;
};
const uploadImages = async (user, payload) => {
    const { authId } = user;
    const userExist = await user_model_1.User.findById(authId);
    if (!userExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'The requested user not found.');
    }
    const { images, type } = payload;
    if (type === 'cover') {
        userExist.cover = images[0];
    }
    else if (type === 'nidFront') {
        userExist.nidFront = images[0];
    }
    else if (type === 'nidBack') {
        userExist.nidBack = images[0];
    }
    else if (type === 'profile') {
        userExist.profile = images[0];
    }
    const updatedUser = await user_model_1.User.findByIdAndUpdate(authId, userExist, {
        new: false,
    });
    if (!updatedUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Failed to upload ${type} image. Please try again.`);
    }
    if (updatedUser[type]) {
        await (0, remove_1.default)(updatedUser[type]);
    }
    return 'Images uploaded successfully.';
};
const getSingleWorker = async (user, workerId) => {
    const worker = await user_model_1.User.findById(workerId)
        .select('-nidFront -nidBack')
        .lean();
    if (!worker) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'The requested worker not found.');
    }
    if (user.role === user_1.USER_ROLES.EMPLOYER) {
        const [chat, booking, isReviewExist] = await Promise.all([
            chat_model_1.Chat.findOne({
                participants: { $all: [user.authId, worker._id] }
            }),
            booking_model_1.Booking.findOne({
                worker: worker._id,
                employer: user.authId,
                status: status_1.BOOKING_STATUS.APPROVED
            }),
            review_model_1.Review.exists({
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
        ]);
        worker.isBooked = !!booking;
        worker.bookingStatus = booking ? booking.status : "";
        worker.chatId = chat ? chat._id : "";
        worker.isReviewed = !!isReviewExist;
    }
    return worker;
};
exports.UserServices = {
    updateProfile,
    createAdmin,
    uploadImages,
    getWorkers,
    getUserProfile,
    getSingleWorker,
};

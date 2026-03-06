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
exports.JobServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const job_model_1 = require("./job.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const job_constants_1 = require("./job.constants");
const mongoose_1 = __importStar(require("mongoose"));
const application_model_1 = require("../application/application.model");
const user_model_1 = require("../user/user.model");
const chat_model_1 = require("../chat/chat.model");
const user_1 = require("../../../enum/user");
const review_model_1 = require("../review/review.model");
const subscription_utils_1 = require("../subscription/subscription.utils");
const createJob = async (userPayload, payload) => {
    if (typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number') {
        payload.location = {
            type: 'Point',
            coordinates: [payload.longitude, payload.latitude], // lng, lat
        };
    }
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const user = await user_model_1.User.findById(userPayload.authId).session(session);
        if (!user)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
        //TODO sensisitve area
        const isUnlimited = await (0, subscription_utils_1.validateQuota)(user, 'job');
        payload.createdBy = user._id;
        const job = await job_model_1.Job.create([payload], { session });
        await (0, subscription_utils_1.consumeQuota)(user._id, 'job', isUnlimited, session);
        await session.commitTransaction();
        // return '🎉 Job created successfully!'
        return isUnlimited
            ? '🎉 Job created successfully! You have unlimited job creation access.'
            : `🎉 Job created successfully! Remaining job creation quota: ${user.availableJobQuota - 1}.`;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
const getAllJobs = async (filterables, pagination) => {
    const { searchTerm, minSalary, maxSalary, latitude, longitude, minRating, maxRating, radius, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    if (minRating || maxRating) {
        andConditions.push({
            rating: {
                $gte: minRating || 0,
                $lte: maxRating || Number.MAX_SAFE_INTEGER,
            },
        });
    }
    if (minSalary || maxSalary) {
        andConditions.push({
            salary: {
                $gte: Number(minSalary) || 0,
                $lte: Number(maxSalary) || Number.MAX_SAFE_INTEGER,
            },
        });
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
        });
    }
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: job_constants_1.jobSearchableFields.map(field => ({
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
    // Filter functionality
    if (Object.keys(sanitizedFilterData).length) {
        andConditions.push({
            $and: Object.entries(sanitizedFilterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        job_model_1.Job.find(whereConditions)
            .populate('createdBy')
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .lean(),
        job_model_1.Job.countDocuments(whereConditions),
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
const getSingleJob = async (user, id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Job ID');
    }
    const result = await job_model_1.Job.findById(id).populate('createdBy').lean();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested job not found, please try again with valid id');
    }
    if (user.role === user_1.USER_ROLES.WORKER) {
        const [chat, application, isReviewExist] = await Promise.all([
            chat_model_1.Chat.findOne({
                participants: { $all: [user.authId, result.createdBy] }
            }),
            application_model_1.Application.findOne({
                applicant: user.authId,
                job: result._id
            }),
            review_model_1.Review.findOne({
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
        ]);
        result.isApplied = !!application;
        result.applicationStatus = application ? application === null || application === void 0 ? void 0 : application.status : "";
        result.isReviewed = !!isReviewExist;
        result.chatId = chat ? chat._id : "";
    }
    return result;
};
const updateJob = async (user, id, payload) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Job ID');
    }
    if (typeof payload.latitude === 'number' &&
        typeof payload.longitude === 'number') {
        payload.location = {
            type: 'Point',
            coordinates: [payload.longitude, payload.latitude], // lng, lat
        };
    }
    const result = await job_model_1.Job.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(id), createdBy: new mongoose_1.Types.ObjectId(user.authId) }, { $set: payload }, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested job not found, please try again with valid id.');
    }
    return 'Job has been updated successfully.';
};
const deleteJob = async (user, id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Job ID');
    }
    const isApplicationExist = await application_model_1.Application.countDocuments({
        job: new mongoose_1.Types.ObjectId(id),
    });
    if (isApplicationExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You can not delete this job, because it has been applied by some users.');
    }
    const result = await job_model_1.Job.findOneAndDelete({
        _id: new mongoose_1.Types.ObjectId(id),
        createdBy: new mongoose_1.Types.ObjectId(user.authId),
    });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting job, please try again with valid id.');
    }
    return 'Job has been deleted successfully.';
};
const applyJob = async (user, jobId) => {
    if (!mongoose_1.Types.ObjectId.isValid(jobId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Job ID');
    }
    const result = await job_model_1.Job.findByIdAndUpdate(new mongoose_1.Types.ObjectId(jobId), { $push: { applicants: new mongoose_1.Types.ObjectId(user.authId) } }, {
        new: true,
        runValidators: true,
    }).lean();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested job not found, please try again with valid id');
    }
    return 'Job has been applied successfully.';
};
const getMyPostedJobs = async (user, filterables, pagination) => {
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const { searchTerm, ...filterData } = filterables;
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: job_constants_1.jobSearchableFields.map(field => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }
    // Filter functionality
    if (Object.keys(filterData).length) {
        andConditions.push({
            $and: Object.entries(filterData).map(([key, value]) => ({
                [key]: value,
            })),
        });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        job_model_1.Job.find({
            createdAtBy: new mongoose_1.Types.ObjectId(user.authId),
            ...whereConditions,
        })
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder }),
        job_model_1.Job.countDocuments({
            createdAtBy: new mongoose_1.Types.ObjectId(user.authId),
            ...whereConditions,
        }),
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
const boostAJob = async (user, jobId) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const job = await job_model_1.Job.findById(jobId)
            .populate('createdBy')
            .session(session);
        if (!job) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Job not found.');
        }
        const owner = job.createdBy;
        if (owner._id.toString() !== user.authId) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Only the job owner can boost this job.');
        }
        //TODO sensisitve area
        const isUnlimited = await (0, subscription_utils_1.validateQuota)(owner, 'boost');
        await (0, subscription_utils_1.consumeQuota)(owner._id, 'boost', isUnlimited, session);
        await job_model_1.Job.findByIdAndUpdate(job._id, { $set: { isBoosted: true } }, { session });
        await session.commitTransaction();
        return '🚀 Job boosted successfully!';
        return isUnlimited
            ? '🚀 Job boosted successfully! You have unlimited boosts.'
            : `🚀 Job boosted successfully! Remaining boosts: ${owner.availableBoostQuota - 1}.`;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
};
exports.JobServices = {
    createJob,
    getAllJobs,
    getSingleJob,
    updateJob,
    deleteJob,
    applyJob,
    getMyPostedJobs,
    boostAJob,
};

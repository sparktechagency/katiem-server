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
exports.ApplicationServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const application_model_1 = require("./application.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const application_constants_1 = require("./application.constants");
const mongoose_1 = __importStar(require("mongoose"));
const job_model_1 = require("../job/job.model");
const status_1 = require("../../../enum/status");
const common_functions_1 = require("../../../utils/common.functions");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const user_model_1 = require("../user/user.model");
const user_1 = require("../../../enum/user");
const chat_service_1 = require("../chat/chat.service");
const logger_1 = require("../../../shared/logger");
const socketInstances_1 = require("../../../helpers/socketInstances");
const createApplication = async (user, jobId) => {
    console.log(user, jobId);
    const userId = new mongoose_1.Types.ObjectId(user.authId);
    const jobObjectId = new mongoose_1.Types.ObjectId(jobId);
    console.log(userId, jobObjectId);
    const [getRequestedUser, isJobExist, isAlreadyApplied] = await Promise.all([
        user_model_1.User.findById(userId).select('isAccountVerified status').lean(),
        job_model_1.Job.findById({
            _id: jobObjectId,
        }),
        application_model_1.Application.exists({
            applicant: userId,
            job: jobObjectId,
        }),
    ]);
    if (isAlreadyApplied) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You have already applied for this job. Please check your applications to see the status of your application.');
    }
    if (!isJobExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'The job you are applying for does not exist. Please check the job ID and try again.');
    }
    if (!getRequestedUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Sorry something went wrong getting your profile information. Please try again.');
    }
    const { isAccountVerified, status } = getRequestedUser;
    if (status === user_1.USER_STATUS.DELETED) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Your account has been deleted. Please contact the admin to resolve the issue.');
    }
    if (status === user_1.USER_STATUS.RESTRICTED) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Your account is restricted. Please contact the admin to resolve the issue.');
    }
    if (!isAccountVerified) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Your account is not verified. Please verify your account to apply for jobs.');
    }
    if (isJobExist.isExpired) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The job you are applying for has expired. Please apply for a new job.');
    }
    const payload = {
        applicant: new mongoose_1.Types.ObjectId(user.authId),
        job: isJobExist._id,
        employer: isJobExist.createdBy,
    };
    const result = await application_model_1.Application.create(payload);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Application, please try again with valid data.');
    }
    //send notificaiton to the job poster
    const notificationData = {
        from: {
            authId: user.authId,
            name: user.name,
            profile: user.profile,
        },
        to: isJobExist.createdBy.toString(),
        title: (0, common_functions_1.getNotificationMessage)(user, 'application', isJobExist),
        body: (0, common_functions_1.getNotificationMessage)(user, 'application', isJobExist),
    };
    await (0, notificationHelper_1.sendNotification)(notificationData.from, notificationData.to, notificationData.title, notificationData.body);
    return `Application has been created successfully.`;
};
const getAllApplications = async (user, filterables, pagination, jobId) => {
    if (!mongoose_1.Types.ObjectId.isValid(jobId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide a valid Job ID');
    }
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: application_constants_1.applicationSearchableFields.map(field => ({
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
    andConditions.push({
        $or: [
            { employer: new mongoose_1.Types.ObjectId(user.authId) },
            { applicant: new mongoose_1.Types.ObjectId(user.authId) },
        ],
    });
    andConditions.push({
        job: new mongoose_1.Types.ObjectId(jobId),
    });
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        application_model_1.Application.find(whereConditions)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate('job')
            .populate('employer')
            .populate('applicant')
            .lean(),
        application_model_1.Application.countDocuments(whereConditions),
    ]);
    //only include phone and email field if the application status is approved
    result.forEach(item => {
        if (item.status !== status_1.APPLICATION_STATUS.APPROVED) {
            (0, common_functions_1.hideUserSensitiveInformation)(item);
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
const getSingleApplication = async (user, id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide a valid Application ID');
    }
    const result = await application_model_1.Application.findById(id)
        .populate('job')
        .populate('employer')
        .populate('applicant')
        .lean();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested application not found, please try again with valid id');
    }
    const ownerId = user.role === user_1.USER_ROLES.EMPLOYER
        ? result.employer._id
        : result.applicant._id;
    if (!ownerId.equals(user.authId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'You are not authorized to access this application');
    }
    if (result.status !== status_1.APPLICATION_STATUS.APPROVED) {
        (0, common_functions_1.hideUserSensitiveInformation)(result);
    }
    return result;
};
const updateApplication = async (user, id, payload) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const employerObjectId = new mongoose_1.Types.ObjectId(user.authId);
        const application = await application_model_1.Application.findOneAndUpdate({
            applicant: new mongoose_1.Types.ObjectId(id),
            employer: employerObjectId,
            status: status_1.APPLICATION_STATUS.PENDING,
        }, payload, { new: true, runValidators: true, session })
            .populate('employer')
            .populate('applicant')
            .populate('job')
            .lean();
        console.log(application, '😒😒😒 application');
        if (!application) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while updating application, please try again with valid application that you have applied.');
        }
        //TODO check whether the application is related to the user trying to update applicaiton status. 
        let createdChat = null;
        //if status is approved then create a chat between employer and applicant
        if (application.status === status_1.APPLICATION_STATUS.APPROVED) {
            createdChat = await chat_service_1.ChatServices.createChatBySystem(application.employer._id, application.applicant._id, session);
        }
        await session.commitTransaction();
        console.log(createdChat, '😂😂😂😂 chat');
        if (createdChat === null || createdChat === void 0 ? void 0 : createdChat.newChat) {
            for (const participant of createdChat.participants) {
                (0, socketInstances_1.emitEvent)(`newChat::${participant}`, createdChat.formattedChat);
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
            title: (0, common_functions_1.getNotificationMessage)(user, 'application', application.job, application.status),
            body: (0, common_functions_1.getNotificationMessage)(user, 'application', application.job, application.status),
        };
        await (0, notificationHelper_1.sendNotification)(notificationData.from, notificationData.to, notificationData.title, notificationData.body);
        return `Application has been ${payload.status} successfully.`;
    }
    catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError_1.default)
            throw error;
        logger_1.logger.error(error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update application, please try again.');
    }
    finally {
        await session.endSession();
    }
};
const deleteApplication = async (user, id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Application ID');
    }
    const deleteCondition = {
        _id: new mongoose_1.Types.ObjectId(id),
        applicant: new mongoose_1.Types.ObjectId(user.authId),
    };
    const result = await application_model_1.Application.findByIdAndDelete(deleteCondition);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting application, please try again with valid application that you have applied.');
    }
    return `Application has been deleted successfully.`;
};
const getApplicationListForWorker = async (user) => {
    const applications = await application_model_1.Application.find({ applicant: user.authId })
        .select(' -applicant -createdAt -updatedAt -__v')
        .lean();
    return applications || [];
};
const getApplicationListForWorkerWithDetails = async (user) => {
    const applications = await application_model_1.Application.find({ applicant: user.authId })
        .populate('employer')
        .populate('job')
        .select(' -applicant -createdAt -updatedAt -__v')
        .lean();
    return applications || [];
};
exports.ApplicationServices = {
    createApplication,
    getAllApplications,
    getSingleApplication,
    updateApplication,
    deleteApplication,
    getApplicationListForWorker,
    getApplicationListForWorkerWithDetails
};

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
exports.MessageServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const message_model_1 = require("./message.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const message_constants_1 = require("./message.constants");
const mongoose_1 = __importStar(require("mongoose"));
const chat_model_1 = require("../chat/chat.model");
const socketInstances_1 = require("../../../helpers/socketInstances");
const createMessage = async (user, chatId, payload) => {
    if (!payload.files && !payload.message) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Message cannot be empty.');
    }
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const requestedUserId = user.authId;
        const chatObjectId = new mongoose_1.Types.ObjectId(chatId);
        const chat = await chat_model_1.Chat.findById(chatObjectId).populate('participants');
        if (!chat) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The chat you are trying to send message to does not exist.');
        }
        const stringParticipantIds = chat.participants.map((participant) => participant._id.toString());
        if (!stringParticipantIds.includes(requestedUserId.toString())) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are not authorized to send message in this chat.');
        }
        const messageType = payload.message
            ? payload.files && payload.files.length > 0
                ? 'both'
                : 'text'
            : 'file';
        payload.type = messageType;
        const otherUser = chat === null || chat === void 0 ? void 0 : chat.participants.find((participant) => participant._id.toString() !== requestedUserId);
        if (!otherUser) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to send message');
        }
        const message = await message_model_1.Message.create({
            chat: chatId,
            receiver: otherUser._id,
            message: payload.message,
            files: payload.files,
            type: messageType
        });
        chat.latestMessage = message._id;
        await chat.save({ session });
        if (!message)
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to send message');
        const returnableMessage = {
            _id: message._id,
            chat: message.chat,
            message: message.message,
            files: message.files,
            type: messageType,
            isRead: false,
            sender: {
                _id: requestedUserId,
                name: user.name || null,
                profile: user.profile || null,
            },
            receiver: {
                _id: otherUser._id,
                name: otherUser.name || null,
                profile: otherUser.profile || null,
            },
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };
        (0, socketInstances_1.emitEvent)(`message::${otherUser._id}`, returnableMessage);
        await session.commitTransaction();
        return returnableMessage;
    }
    catch (error) {
        await session.abortTransaction();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to send message');
    }
    finally {
        session.endSession();
    }
};
const getAllMessages = async (user, chatId, filterables, pagination) => {
    if (!mongoose_1.Types.ObjectId.isValid(chatId)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide a valid Chat ID');
    }
    //check if chat exist
    const chat = await chat_model_1.Chat.findById(chatId).populate('participants');
    if (!chat) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'The chat you are trying to get messages from does not exist.');
    }
    const stringParticipantIds = chat.participants.map((participant) => participant._id.toString());
    if (!stringParticipantIds.includes(user.authId.toString())) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are not authorized to get messages in this chat.');
    }
    const { searchTerm, ...filterData } = filterables;
    const { page, skip, limit, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const andConditions = [];
    // Search functionality
    if (searchTerm) {
        andConditions.push({
            $or: message_constants_1.messageSearchableFields.map((field) => ({
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
        chat: new mongoose_1.Types.ObjectId(chatId),
    });
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [result, total] = await Promise.all([
        message_model_1.Message
            .find({ chat: chat._id })
            .skip(skip)
            .limit(limit)
            // .populate<{ chat: IChat }>('chat')
            .sort({ [sortBy]: sortOrder }).populate('receiver'),
        message_model_1.Message.countDocuments(whereConditions),
    ]);
    //update all the messages to isRead true
    await message_model_1.Message.updateMany(whereConditions, { isRead: true });
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
exports.MessageServices = {
    createMessage,
    getAllMessages,
};

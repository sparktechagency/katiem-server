"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const chat_model_1 = require("./chat.model");
const mongoose_1 = require("mongoose");
const socketInstances_1 = require("../../../helpers/socketInstances");
const createChatBySystem = async (requestedUserId, participantId, session) => {
    const ids = [
        requestedUserId.toString(),
        participantId.toString(),
    ].sort();
    const chatKey = ids.join('_');
    const participants = ids.map(id => new mongoose_1.Types.ObjectId(id));
    const chat = await chat_model_1.Chat.findOneAndUpdate({ chatKey }, {
        $setOnInsert: {
            chatKey,
            participants,
        },
    }, {
        upsert: true,
        new: true,
        session,
        setDefaultsOnInsert: true,
    })
        .populate('participants')
        .populate('latestMessage')
        .lean();
    // Detect whether chat was newly created
    const isNewChat = (chat === null || chat === void 0 ? void 0 : chat.createdAt) &&
        (chat === null || chat === void 0 ? void 0 : chat.updatedAt) &&
        chat.createdAt.getTime() === chat.updatedAt.getTime();
    return {
        participants,
        newChat: isNewChat,
        formattedChat: {
            _id: chat._id,
            participant: chat.participants.find(p => p._id.toString() !== requestedUserId.toString()),
            latestMessage: chat.latestMessage,
        },
    };
};
const createChat = async (user, participantId) => {
    const requestedUserId = user.authId;
    const participants = [requestedUserId, participantId];
    const isChatExist = await chat_model_1.Chat.findOne({
        participants: { $all: participants },
    })
        .populate('participants')
        .populate('latestMessage')
        .lean();
    if (isChatExist) {
        const formattedChat = {
            _id: isChatExist._id,
            participant: isChatExist.participants.find(p => p._id.toString() !== requestedUserId.toString()),
            latestMessage: isChatExist.latestMessage,
        };
        return formattedChat;
    }
    const chat = await chat_model_1.Chat.create({
        participants,
    });
    if (!chat) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create chat');
    }
    const newlyCreatedChat = await chat_model_1.Chat.findById(chat._id)
        .populate('participants')
        .populate('latestMessage')
        .lean();
    const formattedChat = {
        _id: newlyCreatedChat === null || newlyCreatedChat === void 0 ? void 0 : newlyCreatedChat._id,
        participant: newlyCreatedChat === null || newlyCreatedChat === void 0 ? void 0 : newlyCreatedChat.participants.find(p => p._id.toString() !== requestedUserId.toString()),
        latestMessage: newlyCreatedChat === null || newlyCreatedChat === void 0 ? void 0 : newlyCreatedChat.latestMessage,
    };
    for (const participant of participants) {
        (0, socketInstances_1.emitEvent)(`newChat::${participant}`, formattedChat);
    }
    return formattedChat;
};
const getAllChats = async (user) => {
    const result = await chat_model_1.Chat.find({ participants: { $in: [user.authId] } })
        .populate('participants')
        .populate('latestMessage')
        .lean();
    const formattedChat = result.map(chat => ({
        _id: chat._id,
        participant: chat.participants.find(p => p._id.toString() !== user.authId.toString()),
        latestMessage: chat.latestMessage,
    }));
    return formattedChat;
};
const deleteChat = async (id) => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Chat ID');
    }
    const result = await chat_model_1.Chat.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Something went wrong while deleting chat, please try again with valid id.');
    }
    return result;
};
exports.ChatServices = {
    createChat,
    getAllChats,
    deleteChat,
    createChatBySystem,
};

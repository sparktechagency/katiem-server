"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("./chat.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const createChat = (0, catchAsync_1.default)(async (req, res) => {
    const participant = new mongoose_1.Types.ObjectId(req.params.participant);
    const result = await chat_service_1.ChatServices.createChat(req.user, participant);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Chat created successfully',
        data: result,
    });
});
const getAllChats = (0, catchAsync_1.default)(async (req, res) => {
    const result = await chat_service_1.ChatServices.getAllChats(req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Chats retrieved successfully',
        data: result,
    });
});
const deleteChat = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await chat_service_1.ChatServices.deleteChat(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Chat deleted successfully',
        data: result,
    });
});
exports.ChatController = {
    createChat,
    getAllChats,
    deleteChat,
};

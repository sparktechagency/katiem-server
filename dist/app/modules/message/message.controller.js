"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const message_service_1 = require("./message.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pick_1 = __importDefault(require("../../../shared/pick"));
const message_constants_1 = require("./message.constants");
const pagination_1 = require("../../../interfaces/pagination");
const mongoose_1 = require("mongoose");
const createMessage = (0, catchAsync_1.default)(async (req, res) => {
    const messageData = req.body;
    console.log(messageData);
    if (messageData.images && messageData.images.length > 0) {
        messageData.files = messageData.images;
    }
    const result = await message_service_1.MessageServices.createMessage(req.user, new mongoose_1.Types.ObjectId(req.params.chatId), messageData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Message sent successfully.',
        data: result,
    });
});
const getAllMessages = (0, catchAsync_1.default)(async (req, res) => {
    const filterables = (0, pick_1.default)(req.query, message_constants_1.messageFilterables);
    const pagination = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const chatId = new mongoose_1.Types.ObjectId(req.params.chatId);
    const result = await message_service_1.MessageServices.getAllMessages(req.user, chatId, filterables, pagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Messages retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
exports.MessageController = {
    createMessage,
    getAllMessages,
};

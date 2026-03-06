"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientreviewController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const clientReview_service_1 = require("./clientReview.service");
const createClientreview = (0, catchAsync_1.default)(async (req, res) => {
    const { images, media, ...clientreviewData } = req.body;
    if (images && images.length > 0) {
        clientreviewData.images = images[0];
    }
    const result = await clientReview_service_1.ClientreviewServices.createClientreview(clientreviewData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Clientreview created successfully',
        data: result,
    });
});
const updateClientreview = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const clientreviewData = req.body;
    if (clientreviewData.images && clientreviewData.images.length > 0) {
        clientreviewData.image = clientreviewData.images[0];
    }
    const result = await clientReview_service_1.ClientreviewServices.updateClientreview(id, clientreviewData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Clientreview updated successfully',
        data: result,
    });
});
const getAllClientreviews = (0, catchAsync_1.default)(async (req, res) => {
    const result = await clientReview_service_1.ClientreviewServices.getAllClientreviews();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Clientreviews retrieved successfully',
        data: result,
    });
});
exports.ClientreviewController = {
    createClientreview,
    updateClientreview,
    getAllClientreviews,
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("./review.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const pagination_1 = require("../../../interfaces/pagination");
const pick_1 = __importDefault(require("../../../shared/pick"));
const createReview = (0, catchAsync_1.default)(async (req, res) => {
    const reviewData = req.body;
    console.log(reviewData);
    const result = await review_service_1.ReviewServices.createReview(req.user, reviewData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Review created successfully',
        data: result,
    });
});
const updateReview = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const reviewData = req.body;
    const result = await review_service_1.ReviewServices.updateReview(req.user, id, reviewData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Review updated successfully',
        data: result,
    });
});
const getAllReviews = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = await review_service_1.ReviewServices.getAllReviews(req.user, id, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Reviews retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const deleteReview = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await review_service_1.ReviewServices.deleteReview(id, req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Review deleted successfully',
        data: result,
    });
});
exports.ReviewController = {
    createReview,
    updateReview,
    getAllReviews,
    deleteReview,
};

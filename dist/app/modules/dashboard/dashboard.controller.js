"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const dashboard_service_1 = require("./dashboard.service");
const pick_1 = __importDefault(require("../../../shared/pick"));
const pagination_1 = require("../../../interfaces/pagination");
const getGeneralStats = (0, catchAsync_1.default)(async (req, res) => {
    const result = await dashboard_service_1.dashboardService.getGeneralStats();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'General stats retrieved successfully',
        data: result,
    });
});
const getUsers = (0, catchAsync_1.default)(async (req, res) => {
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const filterOptions = (0, pick_1.default)(req.query, ['searchTerm', 'role', 'isAccountVerified', 'status']);
    const result = await dashboard_service_1.dashboardService.getUsers(filterOptions, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Users retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});
const blockUnblockUser = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await dashboard_service_1.dashboardService.blockUnblockUser(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.message,
    });
});
const toggleUserVerification = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await dashboard_service_1.dashboardService.toggleUserVerification(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.message,
    });
});
/**
 * Get monthly revenue from Stripe
 * Query params: year (required, e.g. 2025)
 */
const getMonthlyRevenue = (0, catchAsync_1.default)(async (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const result = await dashboard_service_1.dashboardService.getMonthlyRevenue(year);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Monthly revenue retrieved successfully',
        data: result,
    });
});
/**
 * Get monthly subscription counts (daily breakdown)
 * Query params: year (required), month (required, 1-12)
 */
const getMonthlySubscriptions = (0, catchAsync_1.default)(async (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const result = await dashboard_service_1.dashboardService.getMonthlySubscriptions(year, month);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Monthly subscriptions retrieved successfully',
        data: result,
    });
});
/**
 * Get total employer and worker counts for a month
 * Query params: year (required), month (required, 1-12)
 */
const getMonthlyUserCounts = (0, catchAsync_1.default)(async (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const result = await dashboard_service_1.dashboardService.getMonthlyUserCounts(year, month);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Monthly user counts retrieved successfully',
        data: result,
    });
});
/**
 * Get user details by ID
 * Query params: userId (required)
 */
const getUserDetails = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const result = await dashboard_service_1.dashboardService.getUserDetails(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User details retrieved successfully',
        data: result,
    });
});
exports.DashboardController = {
    getGeneralStats,
    getUsers,
    blockUnblockUser,
    toggleUserVerification,
    getMonthlyRevenue,
    getMonthlySubscriptions,
    getMonthlyUserCounts,
    getUserDetails
};

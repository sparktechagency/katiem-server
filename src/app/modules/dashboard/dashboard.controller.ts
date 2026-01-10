import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { dashboardService } from "./dashboard.service";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../interfaces/pagination";

const getGeneralStats = catchAsync(async (req: Request, res: Response) => {
    const result = await dashboardService.getGeneralStats();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'General stats retrieved successfully',
        data: result,
    });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = pick(req.query, paginationFields);
    const filterOptions = pick(req.query, ['searchTerm', 'role', 'isAccountVerified','status']);

    const result = await dashboardService.getUsers(filterOptions, paginationOptions);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Users retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const blockUnblockUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await dashboardService.blockUnblockUser(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.message,
    });
});

const toggleUserVerification = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await dashboardService.toggleUserVerification(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.message,
    });
});

/**
 * Get monthly revenue from Stripe
 * Query params: year (required, e.g. 2025)
 */
const getMonthlyRevenue = catchAsync(async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const result = await dashboardService.getMonthlyRevenue(year);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Monthly revenue retrieved successfully',
        data: result,
    });
});

/**
 * Get monthly subscription counts (daily breakdown)
 * Query params: year (required), month (required, 1-12)
 */
const getMonthlySubscriptions = catchAsync(async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
    const result = await dashboardService.getMonthlySubscriptions(year, month);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Monthly subscriptions retrieved successfully',
        data: result,
    });
});

/**
 * Get total employer and worker counts for a month
 * Query params: year (required), month (required, 1-12)
 */
const getMonthlyUserCounts = catchAsync(async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
    const result = await dashboardService.getMonthlyUserCounts(year, month);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Monthly user counts retrieved successfully',
        data: result,
    });
});

/**
 * Get user details by ID
 * Query params: userId (required)
 */
const getUserDetails = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await dashboardService.getUserDetails(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'User details retrieved successfully',
        data: result,
    });
});



export const DashboardController = {
    getGeneralStats,
    getUsers,
    blockUnblockUser,
    toggleUserVerification,
    getMonthlyRevenue,
    getMonthlySubscriptions,
    getMonthlyUserCounts,
    getUserDetails
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const stripe_service_1 = require("../stripe/stripe.service");
const subscription_model_1 = require("../subscription/subscription.model");
const user_constants_1 = require("../user/user.constants");
const user_model_1 = require("../user/user.model");
const user_1 = require("../../../enum/user");
const getGeneralStats = async () => {
    const [totalEmployers, totalWorkers, totalSubscription, totalRevenue] = await Promise.all([
        user_model_1.User.countDocuments({ role: 'employer' }),
        user_model_1.User.countDocuments({ role: 'worker' }),
        subscription_model_1.Subscription.countDocuments(),
        stripe_service_1.stripeService.getPlatformRevenue()
    ]);
    return {
        totalEmployers,
        totalWorkers,
        totalSubscription,
        totalRevenue: (totalRevenue === null || totalRevenue === void 0 ? void 0 : totalRevenue.formatted) || 0
    };
};
const getUsers = async (filters, pagination) => {
    const { page, limit, sortOrder, sortBy, skip } = paginationHelper_1.paginationHelper.calculatePagination(pagination);
    const { searchTerm, ...otherFilters } = filters;
    const andConditions = [];
    andConditions.push({ role: { $in: ['employer', 'worker'] } });
    if (searchTerm) {
        andConditions.push({
            $or: user_constants_1.user_searchable_fields.map(field => ({ [field]: { $regex: searchTerm, $options: 'i' } }))
        });
    }
    if (Object.keys(otherFilters).length) {
        andConditions.push({
            $and: Object.entries(otherFilters).map(([field, value]) => ({
                [field]: value
            }))
        });
    }
    const whereConditions = andConditions.length ? { $and: andConditions } : {};
    const [totalUsers, users] = await Promise.all([
        user_model_1.User.countDocuments(whereConditions),
        user_model_1.User.find(whereConditions)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit).lean()
    ]);
    return {
        meta: {
            page,
            limit,
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / limit)
        },
        data: users
    };
};
const blockUnblockUser = async (userId) => {
    //toggle user block unblock
    const isExist = await user_model_1.User.findById(userId).lean();
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested user not found, please check user id.');
    }
    isExist.status = isExist.status === user_1.USER_STATUS.ACTIVE ? user_1.USER_STATUS.RESTRICTED : user_1.USER_STATUS.ACTIVE;
    await user_model_1.User.findByIdAndUpdate(userId, { status: isExist.status });
    return {
        message: isExist.status === user_1.USER_STATUS.ACTIVE ? 'User unblocked successfully' : 'User blocked successfully'
    };
};
const toggleUserVerification = async (userId) => {
    //toggle user block unblock
    const isExist = await user_model_1.User.findById(userId);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested user not found, please check user id.');
    }
    isExist.isAccountVerified = !isExist.isAccountVerified;
    await user_model_1.User.findByIdAndUpdate(userId, { isAccountVerified: isExist.isAccountVerified });
    return {
        message: isExist.isAccountVerified ? 'User verified successfully' : 'User un-verified successfully'
    };
};
/**
 * Get monthly revenue data from Stripe for a given year
 * Returns 12-month data: { month: string, value: number }[]
 */
const getMonthlyRevenue = async (year) => {
    const data = await stripe_service_1.stripeService.getMonthlyRevenue(year);
    return data;
};
/**
 * Get daily subscription counts for a given month
 * Returns 30/31 days data: { date: string, value: number }[]
 */
const getMonthlySubscriptions = async (year, month) => {
    // Get the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    // Initialize daily data
    const dailyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
        dailyData.push({ date: day.toString().padStart(2, '0'), value: 0 });
    }
    // Query subscriptions created in this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const subscriptions = await subscription_model_1.Subscription.find({
        createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    }).lean();
    console.log(subscriptions);
    // Count subscriptions by day
    for (const sub of subscriptions) {
        const createdAt = new Date(sub.createdAt);
        const dayIndex = createdAt.getDate() - 1;
        console.log(dayIndex);
        if (dayIndex >= 0 && dayIndex < dailyData.length) {
            dailyData[dayIndex].value++;
        }
    }
    return dailyData;
};
/**
 * Get employer and worker counts for a given month
 * Returns: { employers: number, workers: number }
 */
const getMonthlyUserCounts = async (year, month) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    const [employers, workers] = await Promise.all([
        user_model_1.User.countDocuments({
            role: 'employer',
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }),
        user_model_1.User.countDocuments({
            role: 'worker',
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        })
    ]);
    return { employers, workers };
};
const getUserDetails = async (userId) => {
    const user = await user_model_1.User.findById(userId).lean();
    if (!user) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Requested user not found, please check user id.');
    }
    return user;
};
exports.dashboardService = {
    getGeneralStats,
    getUsers,
    blockUnblockUser,
    toggleUserVerification,
    getMonthlyRevenue,
    getMonthlySubscriptions,
    getMonthlyUserCounts,
    getUserDetails
};

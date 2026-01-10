import { StatusCodes } from "http-status-codes"
import ApiError from "../../../errors/ApiError"
import { paginationHelper } from "../../../helpers/paginationHelper"
import { IPaginationOptions } from "../../../interfaces/pagination"
import { stripeService } from "../stripe/stripe.service"
import { Subscription } from "../subscription/subscription.model"
import { user_searchable_fields } from "../user/user.constants"
import { IUserFilterableFields } from "../user/user.interface"
import { User } from "../user/user.model"
import { USER_STATUS } from "../../../enum/user"

const getGeneralStats = async () => {
    const [totalEmployers, totalWorkers, totalSubscription, totalRevenue] = await Promise.all([
        User.countDocuments({ role: 'employer' }),
        User.countDocuments({ role: 'worker' }),
        Subscription.countDocuments(),
        stripeService.getPlatformRevenue()
    ])

    return {
        totalEmployers,
        totalWorkers,
        totalSubscription,
        totalRevenue: totalRevenue?.formatted || 0
    }
}

const getUsers = async ( filters: IUserFilterableFields,pagination: IPaginationOptions) => {
    const { page, limit, sortOrder, sortBy, skip } = paginationHelper.calculatePagination(pagination)
    const { searchTerm, ...otherFilters } = filters

    const andConditions = []
    andConditions.push({ role: { $in: ['employer', 'worker'] } })
    if (searchTerm) {
        andConditions.push({
            $or: user_searchable_fields.map(field => ({ [field]: { $regex: searchTerm, $options: 'i' } }))
        })
    }

    if (Object.keys(otherFilters).length) {
        andConditions.push({
            $and: Object.entries(otherFilters).map(([field, value]) => ({
                [field]: value
            }))
        })
    }

    const whereConditions = andConditions.length ? { $and: andConditions } : {}
    const [totalUsers, users] = await Promise.all([
        User.countDocuments(whereConditions),
        User.find(whereConditions)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit).lean()
    ])

    return {
        meta: {
            page,
            limit,
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / limit)
        },
        data: users
    }

}


const blockUnblockUser = async (userId: string) => {
    //toggle user block unblock
    const isExist = await User.findById(userId).lean()
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Requested user not found, please check user id.')
    }

    isExist.status = isExist.status === USER_STATUS.ACTIVE ? USER_STATUS.RESTRICTED : USER_STATUS.ACTIVE
    await User.findByIdAndUpdate(userId, { status: isExist.status })
    return {
        message: isExist.status === USER_STATUS.ACTIVE ? 'User unblocked successfully' : 'User blocked successfully'
    }
}


const toggleUserVerification = async (userId: string) => {
    //toggle user block unblock
    const isExist = await User.findById(userId)
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Requested user not found, please check user id.')
    }

    isExist.isAccountVerified = !isExist.isAccountVerified
    await User.findByIdAndUpdate(userId, { isAccountVerified: isExist.isAccountVerified })
    return {
        message: isExist.isAccountVerified ? 'User verified successfully' : 'User un-verified successfully'
    }
}

/**
 * Get monthly revenue data from Stripe for a given year
 * Returns 12-month data: { month: string, value: number }[]
 */
const getMonthlyRevenue = async (year: number) => {
    const data = await stripeService.getMonthlyRevenue(year)
    return data
}

/**
 * Get daily subscription counts for a given month
 * Returns 30/31 days data: { date: string, value: number }[]
 */
const getMonthlySubscriptions = async (year: number, month: number) => {
    // Get the number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate()

    // Initialize daily data
    const dailyData: { date: string, value: number }[] = []
    for (let day = 1; day <= daysInMonth; day++) {
        dailyData.push({ date: day.toString().padStart(2, '0'), value: 0 })
    }

    // Query subscriptions created in this month
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const subscriptions = await Subscription.find({
        createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    }).lean()

    console.log(subscriptions)

    // Count subscriptions by day
    for (const sub of subscriptions) {
        const createdAt = new Date(sub.createdAt)
        const dayIndex = createdAt.getDate() - 1
        console.log(dayIndex)
        if (dayIndex >= 0 && dayIndex < dailyData.length) {
            dailyData[dayIndex].value++
        }
    }

    return dailyData
}

/**
 * Get employer and worker counts for a given month
 * Returns: { employers: number, workers: number }
 */
const getMonthlyUserCounts = async (year: number, month: number) => {
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const [employers, workers] = await Promise.all([
        User.countDocuments({
            role: 'employer',
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }),
        User.countDocuments({
            role: 'worker',
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        })
    ])

    return { employers, workers }
}

const getUserDetails = async (userId: string) => {
    const user = await User.findById(userId).lean()
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Requested user not found, please check user id.')
    }
    return user
}

export const dashboardService = {
    getGeneralStats,
    getUsers,
    blockUnblockUser,
    toggleUserVerification,
    getMonthlyRevenue,
    getMonthlySubscriptions,
    getMonthlyUserCounts,
    getUserDetails
}

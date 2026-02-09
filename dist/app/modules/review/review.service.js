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
exports.ReviewServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const review_model_1 = require("./review.model");
const mongoose_1 = __importStar(require("mongoose"));
const user_model_1 = require("../user/user.model");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const createReview = async (user, payload) => {
    payload.reviewer = new mongoose_1.Types.ObjectId(user.authId);
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        //check if the user is already reviewed the user
        const isReviewed = await review_model_1.Review.exists({
            reviewer: new mongoose_1.Types.ObjectId(user.authId),
            reviewee: new mongoose_1.Types.ObjectId(payload.reviewee),
        });
        console.log(isReviewed, "😒😒😒😒😒");
        if (isReviewed) {
            console.log(isReviewed, "😒😒😒😒😒");
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You already reviewed this user, please try again with different user.');
        }
        console.log(payload);
        const result = await review_model_1.Review.create([payload], { session });
        console.log(result);
        if (!result) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Review, please try again later.');
        }
        //now update the review count of the user
        await user_model_1.User.findByIdAndUpdate(payload.reviewee, [
            {
                $set: {
                    totalReview: { $add: [{ $ifNull: ['$totalReview', 0] }, 1] },
                    rating: {
                        $divide: [
                            {
                                $add: [
                                    { $multiply: [{ $ifNull: ['$rating', 0] }, { $ifNull: ['$totalReview', 0] }] },
                                    payload.rating
                                ]
                            },
                            { $add: [{ $ifNull: ['$totalReview', 0] }, 1] }
                        ]
                    }
                }
            }
        ], { session, new: true });
        await session.commitTransaction();
        return result[0];
    }
    catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Review, please try again later.');
    }
    finally {
        await session.endSession();
    }
};
const getAllReviews = async (user, id, paginationOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const [result, total] = await Promise.all([
        review_model_1.Review.find({ reviewee: id }).populate('reviewer').populate('reviewee').skip(skip).limit(limit).sort({ [sortBy]: sortOrder }),
        review_model_1.Review.countDocuments({ reviewee: id })
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result
    };
};
const updateReview = async (user, id, payload) => {
    var _a;
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const existingReview = await review_model_1.Review.findById(id).session(session);
        if (!existingReview) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Review not found, please try again later.');
        }
        if ((existingReview === null || existingReview === void 0 ? void 0 : existingReview.reviewer.toString()) !== user.authId) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized to update this review.');
        }
        const oldRating = existingReview.rating;
        const newRating = (_a = payload.rating) !== null && _a !== void 0 ? _a : oldRating;
        // Update user rating
        await user_model_1.User.findByIdAndUpdate(existingReview.reviewee, [
            {
                $set: {
                    rating: {
                        $cond: [
                            { $eq: ['$totalReview', 0] },
                            0,
                            {
                                $divide: [
                                    {
                                        $add: [
                                            { $subtract: [{ $multiply: ['$rating', '$totalReview'] }, oldRating] },
                                            newRating
                                        ]
                                    },
                                    '$totalReview'
                                ]
                            }
                        ]
                    }
                }
            }
        ], { session, new: true });
        // Update review document
        if (payload.rating !== undefined)
            existingReview.rating = newRating;
        if (payload.review !== undefined)
            existingReview.review = payload.review;
        await existingReview.save({ session });
        await session.commitTransaction();
        return "Review updated successfully";
    }
    catch (error) {
        await session.abortTransaction();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Update review failed.');
    }
    finally {
        await session.endSession();
    }
};
const deleteReview = async (id, user) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const existingReview = await review_model_1.Review.findById(id).session(session);
        if (!existingReview) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Review not found, please try again later.');
        }
        if (existingReview.reviewer.toString() !== user.authId) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized to delete this review.');
        }
        // Update reviewee's rating and totalReview
        await user_model_1.User.findByIdAndUpdate(existingReview.reviewee, [
            {
                $set: {
                    totalReview: {
                        $max: [{ $add: ['$totalReview', -1] }, 0] // avoid negative count
                    },
                    rating: {
                        $cond: [
                            { $lte: ['$totalReview', 1] }, // if after deletion totalReview will be 0 or less
                            0,
                            {
                                $divide: [
                                    { $subtract: [{ $multiply: ['$rating', '$totalReview'] }, existingReview.rating] },
                                    { $add: ['$totalReview', -1] }
                                ]
                            }
                        ]
                    }
                }
            }
        ], { session, new: true });
        await existingReview.deleteOne({ session });
        await session.commitTransaction();
        return "Review deleted successfully";
    }
    catch (error) {
        await session.abortTransaction();
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Delete review failed.');
    }
    finally {
        await session.endSession();
    }
};
exports.ReviewServices = {
    createReview,
    getAllReviews,
    updateReview,
    deleteReview,
};

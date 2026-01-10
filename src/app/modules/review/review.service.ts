import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { JwtPayload } from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import { User } from '../user/user.model';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';


const createReview = async (user: JwtPayload, payload: IReview) => {
  payload.reviewer = new Types.ObjectId(user.authId);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    //check if the user is already reviewed the user
    const isReviewed = await Review.exists({
      reviewer: new Types.ObjectId(user.authId),
      reviewee: new Types.ObjectId(payload.reviewee as unknown as string),
    });

    console.log(isReviewed, "😒😒😒😒😒")
    if (isReviewed) {
      console.log(isReviewed, "😒😒😒😒😒")

      throw new ApiError(StatusCodes.BAD_REQUEST, 'You already reviewed this user, please try again with different user.')
    }

    console.log(payload)


    const result = await Review.create([payload], { session });
    console.log(result)
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Review, please try again later.')
    }
    //now update the review count of the user
    await User.findByIdAndUpdate(
      payload.reviewee,
      [
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
      ],
      { session, new: true }
    );

    await session.commitTransaction();
    return result[0];
  } catch (error) {
    await session.abortTransaction();
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Review, please try again later.')
  } finally {
    await session.endSession();
  }
};

const getAllReviews = async (user: JwtPayload, id: string, paginationOptions: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(paginationOptions);



  const [result, total] = await Promise.all([
    Review.find({ reviewee: id }).populate('reviewer').populate('reviewee').skip(skip).limit(limit).sort({ [sortBy]: sortOrder }),
    Review.countDocuments({ reviewee: id })
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


const updateReview = async (
  user: JwtPayload,
  id: string,
  payload: Partial<IReview>
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existingReview = await Review.findById(id).session(session);

    if (!existingReview) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found, please try again later.');
    }
    if (existingReview?.reviewer.toString() !== user.authId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized to update this review.');
    }
    const oldRating = existingReview.rating;
    const newRating = payload.rating ?? oldRating;

    // Update user rating
    await User.findByIdAndUpdate(
      existingReview.reviewee,
      [
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
      ],
      { session, new: true }
    );

    // Update review document
    if (payload.rating !== undefined) existingReview.rating = newRating;
    if (payload.review !== undefined) existingReview.review = payload.review;

    await existingReview.save({ session });
    await session.commitTransaction();



    return "Review updated successfully";
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Update review failed.');
  } finally {
    await session.endSession();
  }
};

const deleteReview = async (id: string, user: JwtPayload) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existingReview = await Review.findById(id).session(session);
    if (!existingReview) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found, please try again later.');
    }

    if (existingReview.reviewer.toString() !== user.authId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized to delete this review.');
    }

    // Update reviewee's rating and totalReview
    await User.findByIdAndUpdate(
      existingReview.reviewee,
      [
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
      ],
      { session, new: true }
    );

    await existingReview.deleteOne({ session });

    await session.commitTransaction();

    return "Review deleted successfully";
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Delete review failed.');
  } finally {
    await session.endSession();
  }
};


export const ReviewServices = {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
};

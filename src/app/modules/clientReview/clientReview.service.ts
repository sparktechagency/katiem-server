import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'



import { Types } from 'mongoose'
import { IClientreview } from './clientReview.interface'
import { Clientreview } from './clientReview.model'
import removeFile from '../../../helpers/image/remove'


const createClientreview = async (payload: IClientreview): Promise<string> => {
  //make sure only 3 reviews are allowed
  const existingReviews = await Clientreview.find({})
  if (existingReviews.length >= 3) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Only 3 reviews are allowed, please try updating existing reviews.',
    )
  }
  const result = await Clientreview.create(payload)
  if (!result) {
    removeFile(payload.image)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create Clientreview, please try again with valid data.',
    )
  }

  return 'Review Created Successfully.'
}

const getAllClientreviews = async () => {
  const result = await Clientreview.find({})

  return result
}

const updateClientreview = async (
  id: string,
  payload: Partial<IClientreview>,
): Promise<string> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Clientreview ID')
  }

  const result = await Clientreview.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      runValidators: true,
    },
  )

  if (payload.image !== result?.image && result?.image) {
    removeFile(result?.image)
  }

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested clientreview not found, please try again with valid id',
    )
  }

  return 'Review updated successfully.'
}

export const ClientreviewServices = {
  createClientreview,
  getAllClientreviews,
  updateClientreview,
}

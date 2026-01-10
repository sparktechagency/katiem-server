import { Types } from 'mongoose'
import { IUser } from '../user/user.interface'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import { User } from '../user/user.model'
import { Subscription } from './subscription.model'

export type QuotaType = 'job' | 'boost' | 'booking'

export const validateQuota = async (
  user: IUser,
  quotaType: QuotaType,
): Promise<boolean> => {
  const subscription = user.subscription
  if (!subscription || !subscription.isActive) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `This feature requires an active subscription. Please subscribe to a plan.`,
    )
  }

  let currentQuota: number | undefined
  let availableQuota: number | undefined

  switch (quotaType) {
    case 'job':
      currentQuota = subscription.currentJobQuota
      availableQuota = user.availableJobQuota
      break
    case 'boost':
      currentQuota = subscription.currentBoostQuota
      availableQuota = user.availableBoostQuota
      break
    case 'booking':
      currentQuota = subscription.currentBookingQuota
      availableQuota = user.availableBookingQuota
      break
  }

  const isUnlimited = currentQuota === -1

  if (!isUnlimited && (availableQuota === undefined || availableQuota <= 0)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `You’ve reached your ${quotaType} limit. Please upgrade your subscription to continue.`,
    )
  }

  return isUnlimited
}

export const consumeQuota = async (
  userId: Types.ObjectId,
  quotaType: QuotaType,
  isUnlimited: boolean,
  session?: any,
) => {
  if (isUnlimited) return

  let field: string
  switch (quotaType) {
    case 'job':
      field = 'availableJobQuota'
      break
    case 'boost':
      field = 'availableBoostQuota'
      break
    case 'booking':
      field = 'availableBookingQuota'
      break
  }

  await User.findByIdAndUpdate(
    userId,
    { $inc: { [field]: -1 } },
    { session, runValidators: true },
  )

}

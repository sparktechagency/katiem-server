import { model, Schema } from 'mongoose'
import { ISubscription, ISubscriptionModel } from './subscription.interface'
import { STRIPE_SUBSCRIPTION_STATUS } from './subscription.constants'

const invoiceSchema = new Schema(
  {
    invoiceId: { type: String, required: true },
    invoiceUrl: { type: String },
    invoicePdf: { type: String },
    amountPaid: { type: Number, required: true },
    currency: { type: String, required: true },
    paidAt: { type: Number, required: true },
    status: { type: String, required: true },
  },
  { _id: false },
)

const subscriptionSchema = new Schema<ISubscription, ISubscriptionModel>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      ref: 'User',
      populate: {
        path: 'userId',
        select:
          'availableJobQuota availableBoostQuota availableBookingQuota',
      }
    },
    stripeCustomerId: { type: String, required: true, index: true },
    stripeSubscriptionId: { type: String, required: true, unique: true },
    packageId: {
      type: String,
      required: true,
      ref: 'Package',
      populate: {
        path: 'packageId',
        select:
          'type regularPrice discountPrice description limits isInstantBooking currency interval features',
      },
    },
    packageType: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(STRIPE_SUBSCRIPTION_STATUS),
      index: true,
    },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: 'usd' },
    startDate: { type: Date, required: true },
    currentPeriodStart: { type: Number, required: true },
    currentPeriodEnd: { type: Number, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Number },
    invoices: { type: [invoiceSchema], default: [] },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient user subscription queries
subscriptionSchema.index({ userId: 1, status: 1 })

export const Subscription = model<ISubscription, ISubscriptionModel>(
  'Subscription',
  subscriptionSchema,
)

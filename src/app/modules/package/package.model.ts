import { model, Schema } from "mongoose";
import { ICoupon, ICouponModel, IPackage, IPackageModel } from "./package.interface";

const packageSchema = new Schema<IPackage, IPackageModel>({
    type: { type: String, required: true, unique: true },
    regularPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true, default: 0 },
    stripeCouponId: { type: String },
    stripeProductId: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    description: { type: String },
    isInstantBooking: { type: Boolean },
    interval: { type: String, enum: ['month', 'year'], default: 'month' },
    limits: {
        jobPostLimit: { type: Number },
        bookingLimit: { type: Number },
        boostLimit: { type: Number },
    },
    currency: { type: String },
    features: { type: [String] },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});



export const Package = model<IPackage, IPackageModel>('Package', packageSchema);

const couponSchema = new Schema<ICoupon, ICouponModel>({
    stripeCouponId: { type: String, required: true },
    description: { type: String },
    percent_off: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default:false }
});

export const Coupon = model<ICoupon, ICouponModel>('Coupon', couponSchema);

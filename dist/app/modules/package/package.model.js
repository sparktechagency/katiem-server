"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coupon = exports.Package = void 0;
const mongoose_1 = require("mongoose");
const packageSchema = new mongoose_1.Schema({
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
exports.Package = (0, mongoose_1.model)('Package', packageSchema);
const couponSchema = new mongoose_1.Schema({
    stripeCouponId: { type: String, required: true },
    description: { type: String },
    percent_off: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: false }
});
exports.Coupon = (0, mongoose_1.model)('Coupon', couponSchema);

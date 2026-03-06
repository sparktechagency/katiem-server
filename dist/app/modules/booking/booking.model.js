"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const status_1 = require("../../../enum/status");
const bookingSchema = new mongoose_1.Schema({
    employer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'employer', select: "name email phone rating reviewCount isAccountVerified createdAt address profile" } },
    worker: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'worker', select: "name email phone rating reviewCount isAccountVerified createdAt address salary salaryType profile category subCategory" } },
    status: { type: String, enum: Object.values(status_1.BOOKING_STATUS), default: status_1.BOOKING_STATUS.PENDING },
}, {
    timestamps: true
});
exports.Booking = (0, mongoose_1.model)('Booking', bookingSchema);

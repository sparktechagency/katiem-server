import { Schema, model } from 'mongoose';
import { IBooking, BookingModel } from './booking.interface';
import { BOOKING_STATUS } from '../../../enum/status';

const bookingSchema = new Schema<IBooking, BookingModel>({
  employer: { type: Schema.Types.ObjectId, ref: 'User', populate: {path:'employer', select:"name email phone rating reviewCount isAccountVerified createdAt address profile"} },
  worker: { type: Schema.Types.ObjectId, ref: 'User', populate: {path:'worker', select:"name email phone rating reviewCount isAccountVerified createdAt address salary salaryType profile category subCategory"} },
  status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
}, {
  timestamps: true
});

export const Booking = model<IBooking, BookingModel>('Booking', bookingSchema);

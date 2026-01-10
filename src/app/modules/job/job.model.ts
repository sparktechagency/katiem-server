import { Schema, model } from 'mongoose';
import { IJob, JobModel } from './job.interface';
import { AVAILABILITY } from '../user/user.interface';

const jobSchema = new Schema<IJob, JobModel>({
  title: { type: String, required: true },
  companyName: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'createdAtBy', select: 'name profile email phone rating reviewCount' } },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  address: { type: String, required: true },
  postDuration: { type: Number, required: true },
  availability: { type: [String], enum: AVAILABILITY, required: true },
  images: { type: [String], required: true },
  skillRequirements: { type: [String], required: true },
  boostWeight: { type: Number, default: 0 },
  salary: { type: Number, required: true },
  salaryType: { type: String, required: true },
  overview: { type: String, required: true },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      default: [0.0, 0.0], // [longitude, latitude]
    },
  },
  isExpired: { type: Boolean, default: false },
  responsibilities: { type: [String], required: true },
  benefits: { type: [String], required: true },
}, {
  timestamps: true
});

jobSchema.index({ location: '2dsphere' })
export const Job = model<IJob, JobModel>('Job', jobSchema);

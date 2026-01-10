import { Schema, model } from 'mongoose';
import { IApplication, ApplicationModel } from './application.interface'; 
import { APPLICATION_STATUS } from '../../../enum/status';

const applicationSchema = new Schema<IApplication, ApplicationModel>({
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  employer: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'employer', select: 'name email phone profile rating reviewCount isAccountVerified deviceToken' } },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'applicant', select: 'name email phone profile rating reviewCount isAccountVerified deviceToken' } },
  status: { type: String, enum: Object.values(APPLICATION_STATUS), default: APPLICATION_STATUS.PENDING },
}, {
  timestamps: true
});

export const Application = model<IApplication, ApplicationModel>('Application', applicationSchema);

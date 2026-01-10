import { Schema, model } from 'mongoose';
import { ClientreviewModel, IClientreview } from './clientreview.interface';


const clientreviewSchema = new Schema<IClientreview, ClientreviewModel>({
  image: { type: String },
  name: { type: String },
  designation: { type: String },
  description: { type: String },
  rating: { type: Number },

}, {
  timestamps: true
});

export const Clientreview = model<IClientreview, ClientreviewModel>('Clientreview', clientreviewSchema);

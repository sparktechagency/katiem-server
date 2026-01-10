import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';

const messageSchema = new Schema<IMessage, MessageModel>({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'reciever', select: 'name profile email phone rating reviewCount isAccountVerified deviceToken' } },
  message: { type: String },
  files: { type: [String] },
  type: { type: String, enum: ['text', 'file', 'both'], default: 'text' },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const Message = model<IMessage, MessageModel>('Message', messageSchema);

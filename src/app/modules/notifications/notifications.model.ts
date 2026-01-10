import { Schema, model } from 'mongoose'
import { INotification, NotificationModel } from './notifications.interface'

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    to: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'to', select: 'name profile email phone rating reviewCount isAccountVerified deviceToken' } },
    from: { type: Schema.Types.ObjectId, ref: 'User', populate: { path: 'from', select: 'name profile email phone rating reviewCount isAccountVerified deviceToken' } },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    isRead: { type: Boolean },
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema,
)

import { Schema, Types, model } from 'mongoose'
import { IChat, ChatModel } from './chat.interface'

const chatSchema = new Schema<IChat, ChatModel>(
  {
    chatKey: { type: String, required: true, unique: true, index: true },
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      populate: {
        path: 'participants',
        select: 'name profile email phone rating reviewCount isAccountVerified',
      },
      required: true,
      validate: {
        validator: (v: Types.ObjectId[]) => v.length === 2,
        message: 'Chat must have exactly two participants',
      },
    },
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      populate: {
        path: 'latestMessage',
        select: 'message files type isRead createdAt updatedAt',
      },
    },
  },
  {
    timestamps: true,
  },
)



export const Chat = model<IChat, ChatModel>('Chat', chatSchema)

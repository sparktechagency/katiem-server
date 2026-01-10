import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { IChat } from './chat.interface'
import { Chat } from './chat.model'
import { JwtPayload } from 'jsonwebtoken'

import mongoose, { Types } from 'mongoose'
import { emitEvent } from '../../../helpers/socketInstances'

const createChatBySystem = async (
  requestedUserId: Types.ObjectId,
  participantId: Types.ObjectId,
  session: mongoose.ClientSession,
) => {
  const ids = [
    requestedUserId.toString(),
    participantId.toString(),
  ].sort()

  const chatKey = ids.join('_')
  const participants = ids.map(id => new Types.ObjectId(id))

  const chat = await Chat.findOneAndUpdate(
    { chatKey },
    {
      $setOnInsert: {
        chatKey,
        participants,
      },
    },
    {
      upsert: true,
      new: true,
      session,
      setDefaultsOnInsert: true,
    }
  )
    .populate('participants')
    .populate('latestMessage')
    .lean()

  // Detect whether chat was newly created
  const isNewChat =
    chat?.createdAt &&
    chat?.updatedAt &&
    chat.createdAt.getTime() === chat.updatedAt.getTime()

  return {
    participants,
    newChat: isNewChat,
    formattedChat: {
      _id: chat!._id,
      participant: chat!.participants.find(
        p => p._id.toString() !== requestedUserId.toString(),
      ),
      latestMessage: chat!.latestMessage,
    },
  }
}

const createChat = async (user: JwtPayload, participantId: Types.ObjectId) => {
  const requestedUserId = user.authId
  const participants = [requestedUserId, participantId]

  const isChatExist = await Chat.findOne({
    participants: { $all: participants },
  })
    .populate('participants')
    .populate('latestMessage')
    .lean()

  if (isChatExist) {
    const formattedChat = {
      _id: isChatExist._id,
      participant: isChatExist.participants.find(
        p => p._id.toString() !== requestedUserId.toString(),
      ),
      latestMessage: isChatExist.latestMessage,
    }
    return formattedChat
  }

  const chat = await Chat.create({
    participants,
  })

  if (!chat) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create chat')
  }

  const newlyCreatedChat = await Chat.findById(chat._id)
    .populate('participants')
    .populate('latestMessage')
    .lean()

  const formattedChat = {
    _id: newlyCreatedChat?._id,
    participant: newlyCreatedChat?.participants.find(
      p => p._id.toString() !== requestedUserId.toString(),
    ),
    latestMessage: newlyCreatedChat?.latestMessage,
  }

  for (const participant of participants) {
    emitEvent(`newChat::${participant}`, formattedChat)
  }

  return formattedChat
}

const getAllChats = async (user: JwtPayload) => {
  const result = await Chat.find({ participants: { $in: [user.authId] } })
    .populate('participants')
    .populate('latestMessage')
    .lean()

  const formattedChat = result.map(chat => ({
    _id: chat._id,
    participant: chat.participants.find(
      p => p._id.toString() !== user.authId.toString(),
    ),
    latestMessage: chat.latestMessage,
  }))

  return formattedChat
}

const deleteChat = async (id: string): Promise<IChat> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Chat ID')
  }

  const result = await Chat.findByIdAndDelete(id)
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting chat, please try again with valid id.',
    )
  }

  return result
}

export const ChatServices = {
  createChat,
  getAllChats,
  deleteChat,
  createChatBySystem,
}

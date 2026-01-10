import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICreateMessage, IMessage, IMessageFilterables, IReturnableMessage } from './message.interface';
import { Message } from './message.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { messageSearchableFields } from './message.constants';
import mongoose, { Types } from 'mongoose';
import { Chat } from '../chat/chat.model';
import { IUser } from '../user/user.interface';
import { emitEvent } from '../../../helpers/socketInstances';
import { IChat } from '../chat/chat.interface';


const createMessage = async (
  user: JwtPayload,
  chatId: Types.ObjectId,
  payload: ICreateMessage
): Promise<IReturnableMessage> => {

  if (!payload.files && !payload.message) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Message cannot be empty.');
  }


  const session = await mongoose.startSession();



  try {
    session.startTransaction();

    const requestedUserId = user.authId;
    const chatObjectId = new Types.ObjectId(chatId);
    const chat = await Chat.findById(chatObjectId).populate<{ participants: IUser[] }>('participants');
    if (!chat) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'The chat you are trying to send message to does not exist.');
    }
    const stringParticipantIds = chat.participants.map((participant: any) => participant._id.toString());
    if (!stringParticipantIds.includes(requestedUserId.toString())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to send message in this chat.');
    }

    const messageType = payload.message
      ? payload.files && payload.files.length > 0
        ? 'both'
        : 'text'
      : 'file';

    payload.type = messageType;

    const otherUser = chat?.participants.find((participant: any) => participant._id.toString() !== requestedUserId);

    if (!otherUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send message');
    }

    const message = await Message.create({
      chat: chatId,
      receiver: otherUser._id,
      message: payload.message,
      files: payload.files,
      type: messageType
    })

    chat.latestMessage = message._id;

    await chat.save({ session });

    if (!message) throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send message');

    const returnableMessage: IReturnableMessage = {

      _id: message._id,
      chat: message.chat,
      message: message.message,
      files: message.files,
      type: messageType,
      isRead: false,
      sender: {
        _id: requestedUserId,
        name: user.name || null,
        profile: user.profile || null,
      },
      receiver: {
        _id: otherUser._id,
        name: otherUser.name || null,
        profile: otherUser.profile || null,
      },
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }

    emitEvent(`message::${otherUser._id}`, returnableMessage);



    await session.commitTransaction();
    return returnableMessage;
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to send message');
  } finally {
    session.endSession();
  }
};

const getAllMessages = async (
  user: JwtPayload,
  chatId: Types.ObjectId,
  filterables: IMessageFilterables,
  pagination: IPaginationOptions
) => {

  if (!Types.ObjectId.isValid(chatId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide a valid Chat ID');
  }


  //check if chat exist
  const chat = await Chat.findById(chatId).populate<{ participants: IUser[] }>('participants');

  if (!chat) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'The chat you are trying to get messages from does not exist.');
  }

  const stringParticipantIds = chat.participants.map((participant: any) => participant._id.toString());
  if (!stringParticipantIds.includes(user.authId.toString())) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You are not authorized to get messages in this chat.');
  }

  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: messageSearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  andConditions.push({
    chat: new Types.ObjectId(chatId),
  })


  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Message
      .find({ chat: chat._id })
      .skip(skip)
      .limit(limit)
      // .populate<{ chat: IChat }>('chat')
      .sort({ [sortBy]: sortOrder }).populate<{ reciever: IUser }>('receiver'),
    Message.countDocuments(whereConditions),
  ]);


  //update all the messages to isRead true
  await Message.updateMany(whereConditions, { isRead: true });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};






export const MessageServices = {
  createMessage,
  getAllMessages,

};
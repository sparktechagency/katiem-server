import { Model, Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { IChat } from '../chat/chat.interface';

export interface IMessage {
  _id: Types.ObjectId;
  chat: Types.ObjectId | IChat;
  receiver: Types.ObjectId | IUser;
  message: string;
  files: string[];
  type: 'text' | 'file' | 'both';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}



export type MessageModel = Model<IMessage, {}, {}>;


export interface IMessageFilterables {
  searchTerm?: string;
  chat?: Types.ObjectId;

  receiver?: Types.ObjectId;
  type?: 'text' | 'file' | 'both';
  isRead?: boolean;
}


export interface ICreateMessage {
  message: string
  files?: string[]
  type?: 'text' | 'file' | 'both';
}


export interface IReturnableMessageUser {
  _id: Types.ObjectId | string;
  name: string | null;
  profile: string | null;
}

export interface IReturnableMessage {
  _id: Types.ObjectId;
  chat: Types.ObjectId | string | IChat;
  message: string;
  files?: string[];   // or whatever file structure you use
  type: string;        // messageType (text, image, file, etc.)
  isRead: boolean;
  sender: IReturnableMessageUser;
  receiver: IReturnableMessageUser;
  createdAt: Date;
  updatedAt: Date;
}
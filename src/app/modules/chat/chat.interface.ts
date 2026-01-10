import { Model, Types } from 'mongoose';

export interface IChat {
  _id: Types.ObjectId;
  chatKey: string;
  participants: Types.ObjectId[];
  latestMessage: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatModel = Model<IChat, {}, {}>;

export interface IChatFilterables {
  searchTerm?: string;
}
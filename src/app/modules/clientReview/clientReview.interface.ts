import { Model, Types } from 'mongoose';

export interface IClientreviewFilterables {
  searchTerm?: string;
  image?: string;
  name?: string;
  designation?: string;
  description?: string;
}

export interface IClientreview {
  _id: Types.ObjectId;
  image: string;
  name: string;
  designation: string;
  description: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientreviewModel = Model<IClientreview, {}, {}>;

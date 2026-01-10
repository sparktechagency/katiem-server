import { Model, Types } from 'mongoose';

export interface ICategoryFilterables {
  searchTerm?: string;
  title?: string;
}

export interface ICategory {
  _id: Types.ObjectId;
  title: string;
  icon: string;
  subCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}


export type CategoryModel = Model<ICategory, {}, {}>;


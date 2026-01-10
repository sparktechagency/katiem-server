import { Schema, model } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface'; 

const categorySchema = new Schema<ICategory, CategoryModel>({
  title: { type: String },
  icon: { type: String, default: '' },
  subCategories: { type: [String] },
}, {
  timestamps: true
});





export const Category = model<ICategory, CategoryModel>('Category', categorySchema);

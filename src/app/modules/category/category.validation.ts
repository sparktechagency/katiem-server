import mongoose from 'mongoose';
import { z } from 'zod';

export const CategoryValidations = {
  create: z.object({
    body: z.object({
      title: z.string(),
      subCategories: z.array(z.string()),
    }),
    

  }),

  

  update: z.object({
    body: z.object({
      title: z.string().optional(),
      subCategories: z.array(z.string()).optional(),
    }),
    params: z.object({
      id: z.string().refine((id) => mongoose.isValidObjectId(id), {
        message: 'Invalid category ID',
      }),
    }),

  }),
};

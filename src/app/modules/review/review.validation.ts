import { Types } from 'mongoose';
import { z } from 'zod';

export const ReviewValidations = {
  create: z.object({
    body: z.object({
      reviewee: z.string().refine((id) => Types.ObjectId.isValid(id), {
        message: 'Invalid reviewee ID',
      }),
      rating: z.number(),
      review: z.string().optional(),
    }),
  }),
  getReview: z.object({
    params: z.object({
      id: z.string().refine((id) => Types.ObjectId.isValid(id), {
        message: 'Invalid review ID',
      }),
    }),
  }),
   deleteReview: z.object({
    params: z.object({
      id: z.string().refine((id) => Types.ObjectId.isValid(id), {
        message: 'Invalid review ID',
      }),
    }),
  }),

  update: z.object({
    body: z.object({
      rating: z.number().optional(),
      review: z.string().optional(),
    }),
  }),
};

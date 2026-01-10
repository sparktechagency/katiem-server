import { Types } from 'mongoose';
import { z } from 'zod';

export const MessageValidations = {
  create: z.object({
   body:z.object({
    message: z.string().optional(),
    images: z.array(z.string()).optional(),
   }),
   params: z.object({
    chatId: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: 'Invalid chat ID format',
    }),
   }),
  }),

  getMessage: z.object({
    params: z.object({
      chatId: z.string().refine((value) => Types.ObjectId.isValid(value), {
        message: 'Invalid chat ID format',
      }),
    }),
  }),
};

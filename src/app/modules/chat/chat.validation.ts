import { Types } from 'mongoose';
import { z } from 'zod';

export const ChatValidations = {
  create: z.object({
   params:z.object({
     participant: z.string().refine((value) => Types.ObjectId.isValid(value), {
      message: 'Invalid participant ID format',
    }),
   })
  }),

};

import { Types } from 'mongoose';
import { z } from 'zod';
import { BOOKING_STATUS } from '../../../enum/status';

export const BookingValidations = {
  create: z.object({
  params:z.object({
    requestedTo: z.string().refine((value) => Types.ObjectId.isValid(value), 'Invalid requestedTo id'),

  })
  }),

  update: z.object({
   body:z.object({
    status: z.string().refine((value) => value === BOOKING_STATUS.APPROVED || value === BOOKING_STATUS.DECLINED, 'Invalid status, must be approved or declined'),
   }),
   params:z.object({
    id: z.string().refine((value) => Types.ObjectId.isValid(value), 'Invalid booking id'),
   })
  }),
};

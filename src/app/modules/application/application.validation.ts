import { Types } from 'mongoose';
import { z } from 'zod';
import { APPLICATION_STATUS } from '../../../enum/status';

export const ApplicationValidations = {
  create: z.object({
    params: z.object({
      jobId: z.string({ required_error: 'Job ID is required' }).refine((value) => Types.ObjectId.isValid(value), {
        message: 'Invalid job ID',
      }),
    }),
  }),

  update: z.object({
    body: z.object({
      status: z.string().refine((value) => [APPLICATION_STATUS.APPROVED, APPLICATION_STATUS.DECLINED].includes(value as APPLICATION_STATUS), {
        message: 'Invalid status value',
      }),
    }),
    params: z.object({
      id: z.string({ required_error: 'Application ID is required' }).refine((value) => Types.ObjectId.isValid(value), {
        message: 'Invalid application ID',
      }),
    }),
  }),
};



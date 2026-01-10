import { z } from 'zod'

export const ClientreviewValidations = {
  create: z.object({
    body: z.object({
      images: z.array(z.string({ required_error: 'Image is required' })),
      name: z.string({ required_error: 'Name is required' }),
      designation: z.string({ required_error: 'Designation is required' }),
      description: z.string({ required_error: 'Description is required' }),
      rating: z.number({ required_error: 'Rating is required' }).min(1).max(5),
    }).strict(),
  }),

  update: z.object({
    body: z.object({
      images: z.array(z.string()).optional(),
      name: z.string().optional(),
      designation: z.string().optional(),
      description: z.string().optional(),
      rating: z.number().optional(),
    }).strict(),
  }),
}

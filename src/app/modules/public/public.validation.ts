import mongoose from 'mongoose'
import { z } from 'zod'

const contactZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    phone: z.string({
      required_error: 'Phone number is required',
    }),
    country: z.string().optional(),
    message: z.string({
      required_error: 'Message is required',
    }),

  }).strict(),
})

 const updateContactZodSchema = z.object({
  body: z.object({
    feedback: z.string().optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Contact id is required',
    }).refine((id) => mongoose.isValidObjectId(id), {
      message: 'Invalid contact id format',
    }),
  }),
})

export const PublicValidation = {
  create: z.object({
    body: z.object({
      content: z.string(),
      type: z.enum(['privacy-policy', 'terms-and-condition','contact','about']),
    }),
  }),

  update: z.object({
    body: z.object({
      content: z.string(),
      type: z.enum(['privacy-policy', 'terms-and-condition','contact','about']),
    }),
  }),
  contactZodSchema,
    updateContactZodSchema,
}

export const FaqValidations = {
  create: z.object({
    body: z.object({
      question: z.string(),
      answer: z.string(),
    }),
  }),

  update: z.object({
    body: z.object({
      question: z.string().optional(),
      answer: z.string().optional(),
    }),
  }),
}

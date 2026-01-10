import { z } from 'zod'

import mongoose from 'mongoose'
import { AVAILABILITY, SALARY_TYPE } from '../user/user.interface'
const availabilityEnum = z.enum([
  AVAILABILITY.FULL_TIME,
  AVAILABILITY.PART_TIME,
  AVAILABILITY.FLEXIBLE,
  AVAILABILITY.ONE_DAY,
  AVAILABILITY.WEEKLY,
  AVAILABILITY.MONTHLY,
  AVAILABILITY.YEARLY,
] as const)

const salaryTypeEnum = z.enum([
  SALARY_TYPE.HOURLY,
  SALARY_TYPE.DAILY,
  SALARY_TYPE.WEEKLY,
  SALARY_TYPE.MONTHLY,
  SALARY_TYPE.YEARLY,
] as const)

export const JobValidations = {
  create: z.object({
    body: z
      .object({
        title: z.string({ required_error: 'Title is required' }),
        companyName: z.string({ required_error: 'Company name is required' }),
        category: z.string({ required_error: 'Category is required' }),
        subCategory: z.string({ required_error: 'Subcategory is required' }),
        address: z.string({ required_error: 'Address is required' }),

        postDuration: z.coerce.number({
          required_error: 'Post duration is required',
          invalid_type_error: 'Post duration must be a number',
        }),
        longitude: z.number({ required_error: "Longtitude is required." }),
        latitude: z.number({ required_error: "Latitude is required." }),
        availability: z
          .array(availabilityEnum)
          .min(1, 'At least one availability option is required'),

        images: z.array(z.string()).min(1, 'At least one image is required'),

        salary: z.number({ required_error: 'Salary is required' }),
        salaryType: salaryTypeEnum,

        overview: z.string({ required_error: 'Overview is required' }),
        skillRequirements: z
          .array(z.string())
          .min(1, 'At least one skill requirement is required'),
        responsibilities: z
          .array(z.string())
          .min(1, 'At least one responsibility is required'),

        benefits: z
          .array(z.string())
          .min(1, 'At least one benefit is required'),
      }).strict(),

  }),

  boost: z.object({
    params: z.object({
      id: z
        .string()
        .refine(id => mongoose.isValidObjectId(id), 'Invalid job ID'),
    }),
  }),

  update: z.object({
    body: z.object({
      companyName: z.string().optional(),
      category: z.string().optional(),
      subCategory: z.string().optional(),
      address: z.string().optional(),
      postDuration: z.coerce.number().optional(),
      availability: z.array(availabilityEnum).optional(),
      images: z.array(z.string()).optional(),
      salary: z.number().optional(),
      salaryType: salaryTypeEnum.optional(),
      longitude: z.number().optional(),
      latitude: z.number().optional(),
      overview: z.string().optional(),
      responsibilities: z.array(z.string()).optional(),
      benifits: z.array(z.string()).optional(),
    }),
    params: z.object({
      id: z
        .string()
        .refine(id => mongoose.isValidObjectId(id), 'Invalid job ID'),
    }),
  }),

  delete: z.object({
    params: z.object({
      id: z
        .string()
        .refine(id => mongoose.isValidObjectId(id), 'Invalid job ID'),
    }),
  }),
  apply: z.object({
    params: z.object({
      id: z
        .string()
        .refine(id => mongoose.isValidObjectId(id), 'Invalid job ID'),
    }),
  }),
  getMyPostedJobs: z.object({
    query: z.object({
      searchTerm: z.string().optional(),
      category: z.string().optional(),
      subCategory: z.string().optional(),
      availability: z.array(availabilityEnum).optional(),
    }),
  }),
}

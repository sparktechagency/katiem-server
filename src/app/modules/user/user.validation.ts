import { z } from 'zod'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import { profile } from 'console'
import { AVAILABILITY } from './user.interface'
import { SALARY_TYPE } from './user.interface'

const createUserZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(6),
    name: z.string({ required_error: 'Name is required' }).optional(),
    phone: z.string({ required_error: 'Phone is required' }).optional(),
    address: z.string().optional(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
    role: z.enum(
      [
        USER_ROLES.ADMIN,
        USER_ROLES.EMPLOYER,
        USER_ROLES.GUEST,
        USER_ROLES.WORKER,
      ],
      {
        message: 'Role must be one of admin, user, guest',
      },
    ),
  }),
})

const workExperienceZodSchema = z.object({
  company: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
})

export const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    profile: z.string().optional(),
    cover: z.string().optional(),
    image: z.array(z.string()).optional(),

    // Worker fields
    category: z.string().optional(),
    subCategory: z.string().optional(),
    availability: z.array(z.nativeEnum(AVAILABILITY)).optional(),

    salaryType: z.nativeEnum(SALARY_TYPE).optional(),

    salary: z.number().optional(),
    about: z.string().optional(),
    workOverview: z.string().optional(),
    coreSkills: z.array(z.string()).optional(),
    yearsOfExperience: z.number().optional(),
    workExperiences: z.array(workExperienceZodSchema).optional(),

    longitude: z.number().optional(),
    latitude: z.number().optional(),

    // Employer fields (optional, if allowed)
    nid: z.boolean().optional(),
    nidFront: z.string().optional(),
    nidBack: z.string().optional(),
    insuranceNumber: z.string().optional(),
    shareCode: z.string().optional(),
    dateOfBirth: z.string().date().optional(),
    isAccountVerified: z.boolean().optional(),

    // Location
    location: z
      .object({
        type: z.literal('Point').optional(),
        coordinates: z.array(z.number()).length(2).optional(), // [lng, lat]
      })
      .optional(),

    appId: z.string().optional(),
    deviceToken: z.string().optional(),

    rating: z.number().optional(),
    reviewCount: z.number().optional(),
  }),
})

const uploadImagesZodSchema = z.object({
  body: z.object({
    images: z.array(z.string()),
    type: z.enum(['cover', 'nidFront', 'nidBack', 'profile']),
  }),
})

const getWorkersZodSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    role: z
      .enum([
        USER_ROLES.EMPLOYER,
        USER_ROLES.WORKER,
        USER_ROLES.EMPLOYER,
        USER_ROLES.GUEST,
      ])
      .optional(),
    status: z
      .enum([USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED, USER_STATUS.DELETED])
      .optional(),
    isAccountVerified: z
      .string()
      .refine(value => value === 'true' || value === 'false', {
        message: 'Verified must be either true or false',
      })
      .optional(),
    category: z.string().optional(),
    subCategory: z.string().optional(),
    address: z.string().optional(),
  }),
})

export const UserValidations = {
  createUserZodSchema,
  updateUserZodSchema,
  uploadImagesZodSchema,
  getWorkersZodSchema,
}

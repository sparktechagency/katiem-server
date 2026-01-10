import { z } from 'zod'
import { USER_ROLES } from '../../../enum/user'

const verifyEmailOrPhoneOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    oneTimeCode: z.string().min(1, { message: 'OTP is required' }),
  }),
})

const forgetPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
  }),
})

const resetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, { message: 'Password is required' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm Password is required' }),
  }),
})

const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    deviceToken: z.string().min(1).optional(),
    password: z.string().min(6, { message: 'Password is required' }),
  }),
})

const verifyAccountZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }),
    oneTimeCode: z.string().min(1, { message: 'OTP is required' }),
  }),
})

const resendOtpZodSchema = z.object({
  body: z.object({
    email: z
      .string()
      .optional()
      .refine(value => !value || /^\S+@\S+\.\S+$/.test(value), {
        message: 'Invalid email format',
      }),
    phone: z
      .string()
      .optional()
      .refine(value => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
        message: 'Invalid phone number format',
      }).optional(),
      authType:z.string(z.enum(['resetPassword','createAccount']).optional())
  }),
})

const changePasswordZodSchema = z.object({
  body: z
    .object({
      currentPassword: z.string({
        required_error: 'Current password is required',
      }),
      newPassword: z
        .string({
          required_error: 'New password is required',
        })
        .min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string({
        required_error: 'Confirm password is required',
      }),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
})

const deleteAccount = z.object({
  body: z
    .object({
    password: z.string({
      required_error: 'Password is required',
    })
   })
    
})

const createUserZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }).min(6),
    name: z.string({ required_error: 'Name is required' }),
    phone: z.string({ required_error: 'Phone is required' }),
    address: z.string(),
    role: z.enum(
      [
        USER_ROLES.EMPLOYER,
        USER_ROLES.WORKER,
      ]
    ).refine((value) => value === USER_ROLES.EMPLOYER || value === USER_ROLES.WORKER, {
      message: 'Role must be either employer or worker',
    }),
  }),
})

const socialLoginZodSchema = z.object({
  body: z.object({
    appId: z.string({ required_error: 'App ID is required' }),
    deviceToken: z.string({ required_error: 'Device token is required' }),
  }),
})

export const AuthValidations = {
  verifyEmailOrPhoneOtpZodSchema,
  forgetPasswordZodSchema,
  resetPasswordZodSchema,
  loginZodSchema,
  verifyAccountZodSchema,
  resendOtpZodSchema,
  changePasswordZodSchema,
  createUserZodSchema,
  deleteAccount,
  socialLoginZodSchema
}

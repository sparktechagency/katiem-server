import { Model, Types } from 'mongoose'

type IAuthentication = {
  restrictionLeftAt: Date | null
  resetPassword: boolean
  wrongLoginAttempts: number
  passwordChangedAt?: Date
  oneTimeCode: string
  latestRequestAt: Date
  expiresAt?: Date
  requestCount?: number
  authType?: 'createAccount' | 'resetPassword'
}

export type IUserSubscription = {
  isActive: boolean
  packageId?: string
  packageType?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  status?: string
  currentPeriodEnd?: number
  cancelAtPeriodEnd?: boolean
}

export type Point = {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export type IAvailability =
  | 'Full-Time'
  | 'Part-Time'
  | 'Flexible'
  | 'One-Day'
  | 'Weekly'
  | 'Monthly'
  | 'Yearly'

export type ISalaryType = 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'

export enum AVAILABILITY {
  FULL_TIME = 'Full-Time',
  PART_TIME = 'Part-Time',
  FLEXIBLE = 'Flexible',
  ONE_DAY = 'One-Day',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
}

export enum SALARY_TYPE {
  HOURLY = 'Hourly',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
}

export type IWorkExperience = {
  company?: string
  title: string
  description: string
  startDate?: Date
  endDate?: Date
}

type IUserSubscriptions = {
  isActive: boolean
  packageId?: string
  packageType?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  status?: string
  currentJobQuota?: number
  currentBoostQuota?: number
  currentBookingQuota?: number
  currentPeriodEnd?: number
  cancelAtPeriodEnd?: boolean
}

export type IUser = {
  _id: Types.ObjectId
  //common fields
  name?: string
  email?: string
  profile?: string
  phone?: string
  status: string
  verified: boolean
  address?: string
  location: Point
  password: string
  role: string
  appId?: string
  deviceToken?: string
  subscription?: IUserSubscriptions
  //employer fields
  nid?: boolean
  nidFront?: string
  nidBack?: string
  insuranceNumber?: string 
  shareCode?: string
  dateOfBirth?: Date
  isAccountVerified?: boolean
  //worker fields
  cover?: string
  category?: string
  subCategory?: string
  availability?: AVAILABILITY[]
  salaryType?: SALARY_TYPE
  salary?: number
  about?: string
  workOverview?: string
  coreSkills?: string[]
  yearsOfExperience?: number
  workExperiences?: IWorkExperience[]
  rating?: number
  totalReview?: number
  availableJobQuota?: number
  availableBoostQuota?: number
  availableBookingQuota?: number

  //added field
  isAvailableToBook?: boolean
  isChatExist?: boolean

  isBooked?: boolean
  bookingStatus?: string
  chatId?: Types.ObjectId | string
  isReviewed?: boolean

  authentication: IAuthentication
  createdAt: Date
  updatedAt: Date
}

export type UserModel = {
  isPasswordMatched: (
    givenPassword: string,
    savedPassword: string,
  ) => Promise<boolean>
} & Model<IUser>

export type IUserFilterableFields = {
  searchTerm?: string
  role?: string
  status?: string
  verified?: boolean
  category?: string
  minSalary?: number
  maxSalary?: number
  minRating?: number
  maxRating?: number
  radius?: number
  latitude?: number
  longitude?: number
  salaryType?: string
  subCategory?: string
  address?: string
}

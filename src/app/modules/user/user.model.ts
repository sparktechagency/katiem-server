import { Schema, model } from 'mongoose'
import { AVAILABILITY, IUser, SALARY_TYPE, UserModel } from './user.interface'
import { USER_ROLES, USER_STATUS } from '../../../enum/user'
import ApiError from '../../../errors/ApiError'
import { StatusCodes } from 'http-status-codes'
import config from '../../../config'
import bcrypt from 'bcrypt'

const workExperienceSchema = new Schema(
  {
    company: { type: String },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false },
)

const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
      // select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      // select: false,
    },
    status: {
      type: String,
      enum: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED, USER_STATUS.DELETED],
      default: USER_STATUS.ACTIVE,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    profile: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: USER_ROLES.EMPLOYER,
    },
    address: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        default: [0.0, 0.0], // [longitude, latitude]
      },
    },
    appId: {
      type: String,
      default: '',
    },
    deviceToken: {
      type: String,
      default: '',
    },

    // 🔹 Subscription fields
    subscription: {
      _id: false,
      type: {
        isActive: { type: Boolean, default: false },
        packageId: { type: String },
        packageType: { type: String },
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        status: { type: String },
        currentJobQuota: { type: Number, default: 0 },
        currentBoostQuota: { type: Number, default: 0 },
        currentBookingQuota: { type: Number, default: 0 },
        currentPeriodEnd: { type: Number },
        cancelAtPeriodEnd: { type: Boolean, default: false },
      },
    },
    availableJobQuota: {
      type: Number,
      default: 0,
    },
    availableBoostQuota: {
      type: Number,
      default: 0,
    },
    availableBookingQuota: {
      type: Number,
      default: 0,
    },

    // 🔹 Employer fields
    nid: {
      type: Boolean,
      default: false,
    },
    nidFront: {
      type: String,
      default: '',
    },
    nidBack: {
      type: String,
      default: '',
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    // 🔹 Worker fields
    category: {
      type: String,
      default: '',
    },
    cover: {
      type: String,
      default: '',
    },
    subCategory: {
      type: String,
      default: '',
    },
    availability: {
      type: [String],
      default: [],
      enum: AVAILABILITY,
    },
    salaryType: {
      type: String,
      enum: SALARY_TYPE,
      // required:false
    },
    salary: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      default: '',
    },
    workOverview: {
      type: String,
      default: '',
    },
    coreSkills: {
      type: [String],
      default: [],
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    workExperiences: {
      type: [workExperienceSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReview: {
      type: Number,
      default: 0,
    },

    // 🔹 Authentication
    authentication: {
      _id: false,
      select: false,
      type: {
        restrictionLeftAt: {
          type: Date,
          default: null,
        },
        resetPassword: {
          type: Boolean,
          default: false,
        },
        wrongLoginAttempts: {
          type: Number,
          default: 0,
        },
        passwordChangedAt: {
          type: Date,
          default: null,
        },
        oneTimeCode: {
          type: String,
          default: '',
        },
        latestRequestAt: {
          type: Date,
          default: null,
        },
        expiresAt: {
          type: Date,
          default: null,
        },
        requestCount: {
          type: Number,
          default: 0,
        },
        authType: {
          type: String,
          default: '',
        },
      },
    },
  },
  {
    timestamps: true,
  },
)

userSchema.index({ location: '2dsphere' })

userSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword)
}

userSchema.pre<IUser>('save', async function (next) {
  //find the user by email
  const isExist = await User.findOne({
    email: this.email,
    status: { $in: [USER_STATUS.ACTIVE, USER_STATUS.RESTRICTED] },
  })
  if (isExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'An account with this email already exists',
    )
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  )
  next()
})

export const User = model<IUser, UserModel>('User', userSchema)

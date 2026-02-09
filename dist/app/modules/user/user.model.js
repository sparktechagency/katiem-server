"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const user_1 = require("../../../enum/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const workExperienceSchema = new mongoose_1.Schema({
    company: { type: String },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
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
        enum: [user_1.USER_STATUS.ACTIVE, user_1.USER_STATUS.RESTRICTED, user_1.USER_STATUS.DELETED],
        default: user_1.USER_STATUS.ACTIVE,
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
        default: user_1.USER_ROLES.EMPLOYER,
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
    insuranceNumber: {
        type: String,
        default: '',
    },
    shareCode: {
        type: String,
        default: '',
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    isBritish: {
        type: Boolean,
        default: false,
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
        enum: user_interface_1.AVAILABILITY,
    },
    salaryType: {
        type: String,
        enum: user_interface_1.SALARY_TYPE,
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
}, {
    timestamps: true,
});
userSchema.index({ location: '2dsphere' });
userSchema.statics.isPasswordMatched = async function (givenPassword, savedPassword) {
    return await bcrypt_1.default.compare(givenPassword, savedPassword);
};
userSchema.pre('save', async function (next) {
    //find the user by email
    const isExist = await exports.User.findOne({
        email: this.email,
        status: { $in: [user_1.USER_STATUS.ACTIVE, user_1.USER_STATUS.RESTRICTED] },
    });
    if (isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'An account with this email already exists');
    }
    this.password = await bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
    next();
});
exports.User = (0, mongoose_1.model)('User', userSchema);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobValidations = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const user_interface_1 = require("../user/user.interface");
const availabilityEnum = zod_1.z.enum([
    user_interface_1.AVAILABILITY.FULL_TIME,
    user_interface_1.AVAILABILITY.PART_TIME,
    user_interface_1.AVAILABILITY.FLEXIBLE,
    user_interface_1.AVAILABILITY.ONE_DAY,
    user_interface_1.AVAILABILITY.WEEKLY,
    user_interface_1.AVAILABILITY.MONTHLY,
    user_interface_1.AVAILABILITY.YEARLY,
]);
const salaryTypeEnum = zod_1.z.enum([
    user_interface_1.SALARY_TYPE.HOURLY,
    user_interface_1.SALARY_TYPE.DAILY,
    user_interface_1.SALARY_TYPE.WEEKLY,
    user_interface_1.SALARY_TYPE.MONTHLY,
    user_interface_1.SALARY_TYPE.YEARLY,
]);
exports.JobValidations = {
    create: zod_1.z.object({
        body: zod_1.z
            .object({
            title: zod_1.z.string({ required_error: 'Title is required' }),
            companyName: zod_1.z.string({ required_error: 'Company name is required' }),
            category: zod_1.z.string({ required_error: 'Category is required' }),
            subCategory: zod_1.z.string({ required_error: 'Subcategory is required' }),
            address: zod_1.z.string({ required_error: 'Address is required' }),
            postDuration: zod_1.z.coerce.number({
                required_error: 'Post duration is required',
                invalid_type_error: 'Post duration must be a number',
            }),
            longitude: zod_1.z.number({ required_error: "Longtitude is required." }),
            latitude: zod_1.z.number({ required_error: "Latitude is required." }),
            availability: zod_1.z
                .array(availabilityEnum)
                .min(1, 'At least one availability option is required'),
            images: zod_1.z.array(zod_1.z.string()).min(1, 'At least one image is required'),
            salary: zod_1.z.number({ required_error: 'Salary is required' }),
            salaryType: salaryTypeEnum,
            overview: zod_1.z.string({ required_error: 'Overview is required' }),
            skillRequirements: zod_1.z
                .array(zod_1.z.string())
                .min(1, 'At least one skill requirement is required'),
            responsibilities: zod_1.z
                .array(zod_1.z.string())
                .min(1, 'At least one responsibility is required'),
            benefits: zod_1.z
                .array(zod_1.z.string())
                .min(1, 'At least one benefit is required'),
        }).strict(),
    }),
    boost: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z
                .string()
                .refine(id => mongoose_1.default.isValidObjectId(id), 'Invalid job ID'),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            companyName: zod_1.z.string().optional(),
            category: zod_1.z.string().optional(),
            subCategory: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            postDuration: zod_1.z.coerce.number().optional(),
            availability: zod_1.z.array(availabilityEnum).optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
            salary: zod_1.z.number().optional(),
            salaryType: salaryTypeEnum.optional(),
            longitude: zod_1.z.number().optional(),
            latitude: zod_1.z.number().optional(),
            overview: zod_1.z.string().optional(),
            responsibilities: zod_1.z.array(zod_1.z.string()).optional(),
            benifits: zod_1.z.array(zod_1.z.string()).optional(),
        }),
        params: zod_1.z.object({
            id: zod_1.z
                .string()
                .refine(id => mongoose_1.default.isValidObjectId(id), 'Invalid job ID'),
        }),
    }),
    delete: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z
                .string()
                .refine(id => mongoose_1.default.isValidObjectId(id), 'Invalid job ID'),
        }),
    }),
    apply: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z
                .string()
                .refine(id => mongoose_1.default.isValidObjectId(id), 'Invalid job ID'),
        }),
    }),
    getMyPostedJobs: zod_1.z.object({
        query: zod_1.z.object({
            searchTerm: zod_1.z.string().optional(),
            category: zod_1.z.string().optional(),
            subCategory: zod_1.z.string().optional(),
            availability: zod_1.z.array(availabilityEnum).optional(),
        }),
    }),
};

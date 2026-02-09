"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = exports.updateUserZodSchema = void 0;
const zod_1 = require("zod");
const user_1 = require("../../../enum/user");
const user_interface_1 = require("./user.interface");
const user_interface_2 = require("./user.interface");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'Email is required' }).email(),
        password: zod_1.z.string({ required_error: 'Password is required' }).min(6),
        name: zod_1.z.string({ required_error: 'Name is required' }).optional(),
        phone: zod_1.z.string({ required_error: 'Phone is required' }).optional(),
        address: zod_1.z.string().optional(),
        longitude: zod_1.z.number().optional(),
        latitude: zod_1.z.number().optional(),
        role: zod_1.z.enum([
            user_1.USER_ROLES.ADMIN,
            user_1.USER_ROLES.EMPLOYER,
            user_1.USER_ROLES.GUEST,
            user_1.USER_ROLES.WORKER,
        ], {
            message: 'Role must be one of admin, user, guest',
        }),
    }),
});
const workExperienceZodSchema = zod_1.z.object({
    company: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    startDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    endDate: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.updateUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        profile: zod_1.z.string().optional(),
        cover: zod_1.z.string().optional(),
        image: zod_1.z.array(zod_1.z.string()).optional(),
        // Worker fields
        category: zod_1.z.string().optional(),
        subCategory: zod_1.z.string().optional(),
        availability: zod_1.z.array(zod_1.z.nativeEnum(user_interface_1.AVAILABILITY)).optional(),
        salaryType: zod_1.z.nativeEnum(user_interface_2.SALARY_TYPE).optional(),
        salary: zod_1.z.number().optional(),
        about: zod_1.z.string().optional(),
        workOverview: zod_1.z.string().optional(),
        coreSkills: zod_1.z.array(zod_1.z.string()).optional(),
        yearsOfExperience: zod_1.z.number().optional(),
        workExperiences: zod_1.z.array(workExperienceZodSchema).optional(),
        longitude: zod_1.z.number().optional(),
        latitude: zod_1.z.number().optional(),
        // Employer fields (optional, if allowed)
        nid: zod_1.z.boolean().optional(),
        nidFront: zod_1.z.string().optional(),
        nidBack: zod_1.z.string().optional(),
        insuranceNumber: zod_1.z.string().optional(),
        shareCode: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.string().date().optional(),
        isBritish: zod_1.z.boolean().optional(),
        isAccountVerified: zod_1.z.boolean().optional(),
        // Location
        location: zod_1.z
            .object({
            type: zod_1.z.literal('Point').optional(),
            coordinates: zod_1.z.array(zod_1.z.number()).length(2).optional(), // [lng, lat]
        })
            .optional(),
        appId: zod_1.z.string().optional(),
        deviceToken: zod_1.z.string().optional(),
        rating: zod_1.z.number().optional(),
        reviewCount: zod_1.z.number().optional(),
    }),
});
const uploadImagesZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        images: zod_1.z.array(zod_1.z.string()),
        type: zod_1.z.enum(['cover', 'nidFront', 'nidBack', 'profile']),
    }),
});
const getWorkersZodSchema = zod_1.z.object({
    query: zod_1.z.object({
        searchTerm: zod_1.z.string().optional(),
        role: zod_1.z
            .enum([
            user_1.USER_ROLES.EMPLOYER,
            user_1.USER_ROLES.WORKER,
            user_1.USER_ROLES.EMPLOYER,
            user_1.USER_ROLES.GUEST,
        ])
            .optional(),
        status: zod_1.z
            .enum([user_1.USER_STATUS.ACTIVE, user_1.USER_STATUS.RESTRICTED, user_1.USER_STATUS.DELETED])
            .optional(),
        isAccountVerified: zod_1.z
            .string()
            .refine(value => value === 'true' || value === 'false', {
            message: 'Verified must be either true or false',
        })
            .optional(),
        category: zod_1.z.string().optional(),
        subCategory: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }),
});
exports.UserValidations = {
    createUserZodSchema,
    updateUserZodSchema: exports.updateUserZodSchema,
    uploadImagesZodSchema,
    getWorkersZodSchema,
};

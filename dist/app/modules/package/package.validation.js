"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageValidationSchema = void 0;
const zod_1 = require("zod");
const createPackageValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.string(),
        regularPrice: zod_1.z.number(),
        description: zod_1.z.string().optional(),
        isInstantBooking: zod_1.z.boolean().optional(),
        interval: zod_1.z.enum(['month', 'year']).optional(),
        limits: zod_1.z.object({
            jobPostLimit: zod_1.z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Job post limit must be a non-negative number or -1 for unlimited',
            }).optional(),
            bookingLimit: zod_1.z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Booking limit must be a non-negative number or -1 for unlimited',
            }).optional(),
            boostLimit: zod_1.z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Boost limit must be a non-negative number or -1 for unlimited',
            }).optional(),
        }).optional(),
        currency: zod_1.z.string().optional(),
        features: zod_1.z.array(zod_1.z.string()).optional(),
    })
});
const updatePackageValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.string().optional(),
        isInstantBooking: zod_1.z.boolean().optional(),
        limits: zod_1.z.object({
            jobPostLimit: zod_1.z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Job post limit must be a non-negative number or -1 for unlimited',
            }).optional(),
            bookingLimit: zod_1.z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Booking limit must be a non-negative number or -1 for unlimited',
            }).optional(),
            boostLimit: zod_1.z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Boost limit must be a non-negative number or -1 for unlimited',
            }).optional(),
        }).optional(),
        features: zod_1.z.array(zod_1.z.string()).optional(),
    })
});
const togglePackageValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        packageId: zod_1.z.string(),
    })
});
const applyDiscountValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        percent_off: zod_1.z.number().refine((val) => val >= 0 && val <= 100, {
            message: 'Discount percent must be between 0 and 100',
        }),
        description: zod_1.z.string().optional(),
    })
});
exports.packageValidationSchema = {
    createPackageValidationSchema,
    updatePackageValidationSchema,
    togglePackageValidationSchema,
    applyDiscountValidationSchema,
};

import { z } from "zod";

const createPackageValidationSchema = z.object({
   body: z.object({
    type: z.string(),
    regularPrice: z.number(),
    description: z.string().optional(),
    isInstantBooking: z.boolean().optional(),
    interval: z.enum(['month', 'year']).optional(),
    limits: z.object({
        jobPostLimit: z.number().refine((val) => val !== undefined && val >= -1, {
            message: 'Job post limit must be a non-negative number or -1 for unlimited',
        }).optional(),
        bookingLimit: z.number().refine((val) => val !== undefined && val >= -1, {
            message: 'Booking limit must be a non-negative number or -1 for unlimited',
        }).optional(),
        boostLimit: z.number().refine((val) => val !== undefined && val >= -1, {
            message: 'Boost limit must be a non-negative number or -1 for unlimited',
        }).optional(),
    }).optional(),
    currency: z.string().optional(),
    features: z.array(z.string()).optional(),
   })
});

const updatePackageValidationSchema = z.object({
    body: z.object({
        type: z.string().optional(),
        isInstantBooking: z.boolean().optional(),
        limits: z.object({
            jobPostLimit: z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Job post limit must be a non-negative number or -1 for unlimited',
            }).optional(),
            bookingLimit: z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Booking limit must be a non-negative number or -1 for unlimited',
            }).optional(),
            boostLimit: z.number().refine((val) => val !== undefined && val >= -1, {
                message: 'Boost limit must be a non-negative number or -1 for unlimited',
            }).optional(),
        }).optional(),
        features: z.array(z.string()).optional(),
    })
});

const togglePackageValidationSchema = z.object({
    params: z.object({
        packageId: z.string(),
    })
});

const applyDiscountValidationSchema = z.object({
    body: z.object({
        percent_off: z.number().refine((val) => val >= 0 && val <= 100, {
            message: 'Discount percent must be between 0 and 100',
        }),
        description: z.string().optional(),
    })
});



export const packageValidationSchema = {
    createPackageValidationSchema,
    updatePackageValidationSchema,
    togglePackageValidationSchema,
    applyDiscountValidationSchema,
}
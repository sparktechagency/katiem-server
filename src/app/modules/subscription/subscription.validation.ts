import mongoose from 'mongoose';
import { z } from 'zod';

const createCheckoutSessionSchema = z.object({
    params: z.object({
        packageId: z.string({
            required_error: 'Package ID is required',
            //check mongodb if package exists
        }).refine((val)=> mongoose.Types.ObjectId.isValid(val), {
            message: 'Invalid package ID',
        }),
    }),
});

const cancelSubscriptionSchema = z.object({
    body: z.object({
        immediate: z.boolean().optional().default(false),
    }),
});

const upgradeSubscriptionSchema = z.object({
    body: z.object({
        packageId: z.string({
            required_error: 'New package ID is required',
        }).min(1, 'Package ID cannot be empty'),
    }),
});

export const subscriptionValidation = {
    createCheckoutSessionSchema,
    cancelSubscriptionSchema,
    upgradeSubscriptionSchema,
};

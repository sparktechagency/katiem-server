"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionValidation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const createCheckoutSessionSchema = zod_1.z.object({
    params: zod_1.z.object({
        packageId: zod_1.z.string({
            required_error: 'Package ID is required',
            //check mongodb if package exists
        }).refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
            message: 'Invalid package ID',
        }),
    }),
});
const cancelSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        immediate: zod_1.z.boolean().optional().default(false),
    }),
});
const upgradeSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        packageId: zod_1.z.string({
            required_error: 'New package ID is required',
        }).min(1, 'Package ID cannot be empty'),
    }),
});
exports.subscriptionValidation = {
    createCheckoutSessionSchema,
    cancelSubscriptionSchema,
    upgradeSubscriptionSchema,
};

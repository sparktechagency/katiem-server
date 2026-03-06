"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqValidations = exports.PublicValidation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const contactZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Name is required',
        }),
        email: zod_1.z
            .string({
            required_error: 'Email is required',
        })
            .email('Invalid email format'),
        phone: zod_1.z.string({
            required_error: 'Phone number is required',
        }),
        country: zod_1.z.string().optional(),
        message: zod_1.z.string({
            required_error: 'Message is required',
        }),
    }).strict(),
});
const updateContactZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        feedback: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string({
            required_error: 'Contact id is required',
        }).refine((id) => mongoose_1.default.isValidObjectId(id), {
            message: 'Invalid contact id format',
        }),
    }),
});
exports.PublicValidation = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            content: zod_1.z.string(),
            type: zod_1.z.enum(['privacy-policy', 'terms-and-condition', 'contact', 'about']),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            content: zod_1.z.string(),
            type: zod_1.z.enum(['privacy-policy', 'terms-and-condition', 'contact', 'about']),
        }),
    }),
    contactZodSchema,
    updateContactZodSchema,
};
exports.FaqValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            question: zod_1.z.string(),
            answer: zod_1.z.string(),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            question: zod_1.z.string().optional(),
            answer: zod_1.z.string().optional(),
        }),
    }),
};

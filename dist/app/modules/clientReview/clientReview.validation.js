"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientreviewValidations = void 0;
const zod_1 = require("zod");
exports.ClientreviewValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            images: zod_1.z.array(zod_1.z.string({ required_error: 'Image is required' })),
            name: zod_1.z.string({ required_error: 'Name is required' }),
            designation: zod_1.z.string({ required_error: 'Designation is required' }),
            description: zod_1.z.string({ required_error: 'Description is required' }),
            rating: zod_1.z.number({ required_error: 'Rating is required' }).min(1).max(5),
        }).strict(),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            images: zod_1.z.array(zod_1.z.string()).optional(),
            name: zod_1.z.string().optional(),
            designation: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            rating: zod_1.z.number().optional(),
        }).strict(),
    }),
};

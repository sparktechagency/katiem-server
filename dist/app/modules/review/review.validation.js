"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewValidations = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.ReviewValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            reviewee: zod_1.z.string().refine((id) => mongoose_1.Types.ObjectId.isValid(id), {
                message: 'Invalid reviewee ID',
            }),
            rating: zod_1.z.number(),
            review: zod_1.z.string().optional(),
        }),
    }),
    getReview: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().refine((id) => mongoose_1.Types.ObjectId.isValid(id), {
                message: 'Invalid review ID',
            }),
        }),
    }),
    deleteReview: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().refine((id) => mongoose_1.Types.ObjectId.isValid(id), {
                message: 'Invalid review ID',
            }),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            rating: zod_1.z.number().optional(),
            review: zod_1.z.string().optional(),
        }),
    }),
};

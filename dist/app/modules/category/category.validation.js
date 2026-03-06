"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryValidations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
exports.CategoryValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string(),
            subCategories: zod_1.z.array(zod_1.z.string()),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            title: zod_1.z.string().optional(),
            subCategories: zod_1.z.array(zod_1.z.string()).optional(),
        }),
        params: zod_1.z.object({
            id: zod_1.z.string().refine((id) => mongoose_1.default.isValidObjectId(id), {
                message: 'Invalid category ID',
            }),
        }),
    }),
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageValidations = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.MessageValidations = {
    create: zod_1.z.object({
        body: zod_1.z.object({
            message: zod_1.z.string().optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
        }),
        params: zod_1.z.object({
            chatId: zod_1.z.string().refine((value) => mongoose_1.Types.ObjectId.isValid(value), {
                message: 'Invalid chat ID format',
            }),
        }),
    }),
    getMessage: zod_1.z.object({
        params: zod_1.z.object({
            chatId: zod_1.z.string().refine((value) => mongoose_1.Types.ObjectId.isValid(value), {
                message: 'Invalid chat ID format',
            }),
        }),
    }),
};

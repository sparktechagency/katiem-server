"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatValidations = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
exports.ChatValidations = {
    create: zod_1.z.object({
        params: zod_1.z.object({
            participant: zod_1.z.string().refine((value) => mongoose_1.Types.ObjectId.isValid(value), {
                message: 'Invalid participant ID format',
            }),
        })
    }),
};

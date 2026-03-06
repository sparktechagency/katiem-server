"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationValidations = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const status_1 = require("../../../enum/status");
exports.ApplicationValidations = {
    create: zod_1.z.object({
        params: zod_1.z.object({
            jobId: zod_1.z.string({ required_error: 'Job ID is required' }).refine((value) => mongoose_1.Types.ObjectId.isValid(value), {
                message: 'Invalid job ID',
            }),
        }),
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            status: zod_1.z.string().refine((value) => [status_1.APPLICATION_STATUS.APPROVED, status_1.APPLICATION_STATUS.DECLINED].includes(value), {
                message: 'Invalid status value',
            }),
        }),
        params: zod_1.z.object({
            id: zod_1.z.string({ required_error: 'Application ID is required' }).refine((value) => mongoose_1.Types.ObjectId.isValid(value), {
                message: 'Invalid application ID',
            }),
        }),
    }),
};

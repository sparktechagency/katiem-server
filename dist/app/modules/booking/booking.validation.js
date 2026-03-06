"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingValidations = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const status_1 = require("../../../enum/status");
exports.BookingValidations = {
    create: zod_1.z.object({
        params: zod_1.z.object({
            requestedTo: zod_1.z.string().refine((value) => mongoose_1.Types.ObjectId.isValid(value), 'Invalid requestedTo id'),
        })
    }),
    update: zod_1.z.object({
        body: zod_1.z.object({
            status: zod_1.z.string().refine((value) => value === status_1.BOOKING_STATUS.APPROVED || value === status_1.BOOKING_STATUS.DECLINED, 'Invalid status, must be approved or declined'),
        }),
        params: zod_1.z.object({
            id: zod_1.z.string().refine((value) => mongoose_1.Types.ObjectId.isValid(value), 'Invalid booking id'),
        })
    }),
};

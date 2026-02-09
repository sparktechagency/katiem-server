"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = require("mongoose");
const status_1 = require("../../../enum/status");
const applicationSchema = new mongoose_1.Schema({
    job: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job' },
    employer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'employer', select: 'name email phone profile rating reviewCount isAccountVerified deviceToken' } },
    applicant: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', populate: { path: 'applicant', select: 'name email phone profile rating reviewCount isAccountVerified deviceToken' } },
    status: { type: String, enum: Object.values(status_1.APPLICATION_STATUS), default: status_1.APPLICATION_STATUS.PENDING },
}, {
    timestamps: true
});
exports.Application = (0, mongoose_1.model)('Application', applicationSchema);

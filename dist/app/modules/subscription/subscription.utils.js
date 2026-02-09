"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeQuota = exports.validateQuota = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = require("../user/user.model");
const validateQuota = async (user, quotaType) => {
    const subscription = user.subscription;
    if (!subscription || !subscription.isActive) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, `This feature requires an active subscription. Please subscribe to a plan.`);
    }
    let currentQuota;
    let availableQuota;
    switch (quotaType) {
        case 'job':
            currentQuota = subscription.currentJobQuota;
            availableQuota = user.availableJobQuota;
            break;
        case 'boost':
            currentQuota = subscription.currentBoostQuota;
            availableQuota = user.availableBoostQuota;
            break;
        case 'booking':
            currentQuota = subscription.currentBookingQuota;
            availableQuota = user.availableBookingQuota;
            break;
    }
    const isUnlimited = currentQuota === -1;
    if (!isUnlimited && (availableQuota === undefined || availableQuota <= 0)) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, `You’ve reached your ${quotaType} limit. Please upgrade your subscription to continue.`);
    }
    return isUnlimited;
};
exports.validateQuota = validateQuota;
const consumeQuota = async (userId, quotaType, isUnlimited, session) => {
    if (isUnlimited)
        return;
    let field;
    switch (quotaType) {
        case 'job':
            field = 'availableJobQuota';
            break;
        case 'boost':
            field = 'availableBoostQuota';
            break;
        case 'booking':
            field = 'availableBookingQuota';
            break;
    }
    await user_model_1.User.findByIdAndUpdate(userId, { $inc: { [field]: -1 } }, { session, runValidators: true });
};
exports.consumeQuota = consumeQuota;

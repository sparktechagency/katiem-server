"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const subscription_service_1 = require("./subscription.service");
const createCheckoutSession = (0, catchAsync_1.default)(async (req, res) => {
    const { packageId } = req.params;
    console.log(packageId);
    const userId = req.user.authId;
    const userEmail = req.user.email;
    const result = await subscription_service_1.subscriptionService.createCheckoutSession(userId, packageId, userEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Checkout session created successfully',
        data: result,
    });
});
const cancelSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const { immediate = false } = req.body;
    const userId = req.user.authId;
    const result = await subscription_service_1.subscriptionService.cancelSubscription(userId, immediate);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});
const reactivateSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.authId;
    const result = await subscription_service_1.subscriptionService.reactivateSubscription(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});
const upgradeSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const { packageId } = req.body;
    const userId = req.user.authId;
    const result = await subscription_service_1.subscriptionService.upgradeSubscription(userId, packageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});
const getMySubscription = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.authId;
    const result = await subscription_service_1.subscriptionService.getUserSubscription(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: result ? 'Subscription retrieved successfully' : 'No active subscription found',
        data: result,
    });
});
const getInvoices = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.authId;
    const result = await subscription_service_1.subscriptionService.getUserInvoices(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Invoices retrieved successfully',
        data: result,
    });
});
const getBillingPortal = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.authId;
    const result = await subscription_service_1.subscriptionService.getBillingPortalUrl(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Billing portal URL generated successfully',
        data: result,
    });
});
exports.SubscriptionController = {
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    upgradeSubscription,
    getMySubscription,
    getInvoices,
    getBillingPortal,
};

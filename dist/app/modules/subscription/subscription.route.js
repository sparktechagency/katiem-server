"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = require("express");
const subscription_controller_1 = require("./subscription.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = require("../../../enum/user");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const subscription_validation_1 = require("./subscription.validation");
const router = (0, express_1.Router)();
// Create checkout session for subscription
router.post('/checkout/:packageId', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), (0, validateRequest_1.default)(subscription_validation_1.subscriptionValidation.createCheckoutSessionSchema), subscription_controller_1.SubscriptionController.createCheckoutSession);
// Get current subscription
router.get('/my-subscription', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), subscription_controller_1.SubscriptionController.getMySubscription);
// Cancel subscription
router.post('/cancel', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), (0, validateRequest_1.default)(subscription_validation_1.subscriptionValidation.cancelSubscriptionSchema), subscription_controller_1.SubscriptionController.cancelSubscription);
// Reactivate subscription (before period end)
router.post('/reactivate', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), subscription_controller_1.SubscriptionController.reactivateSubscription);
// Upgrade/downgrade subscription
router.post('/upgrade', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), (0, validateRequest_1.default)(subscription_validation_1.subscriptionValidation.upgradeSubscriptionSchema), subscription_controller_1.SubscriptionController.upgradeSubscription);
// Get invoices
router.get('/invoices', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), subscription_controller_1.SubscriptionController.getInvoices);
// Get billing portal URL
router.get('/billing-portal', (0, auth_1.default)(user_1.USER_ROLES.EMPLOYER), subscription_controller_1.SubscriptionController.getBillingPortal);
exports.SubscriptionRoutes = router;

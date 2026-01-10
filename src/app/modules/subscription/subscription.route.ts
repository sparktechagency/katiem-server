import { Router } from "express";
import { SubscriptionController } from "./subscription.controller";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../../../enum/user";
import validateRequest from "../../middleware/validateRequest";
import { subscriptionValidation } from "./subscription.validation";

const router = Router();

// Create checkout session for subscription
router.post(
    '/checkout/:packageId',
    auth(USER_ROLES.EMPLOYER),
    validateRequest(subscriptionValidation.createCheckoutSessionSchema),
    SubscriptionController.createCheckoutSession
);

// Get current subscription
router.get(
    '/my-subscription',
    auth(USER_ROLES.EMPLOYER),
    SubscriptionController.getMySubscription
);

// Cancel subscription
router.post(
    '/cancel',
    auth(USER_ROLES.EMPLOYER),
    validateRequest(subscriptionValidation.cancelSubscriptionSchema),
    SubscriptionController.cancelSubscription
);

// Reactivate subscription (before period end)
router.post(
    '/reactivate',
    auth(USER_ROLES.EMPLOYER),
    SubscriptionController.reactivateSubscription
);

// Upgrade/downgrade subscription
router.post(
    '/upgrade',
    auth(USER_ROLES.EMPLOYER),
    validateRequest(subscriptionValidation.upgradeSubscriptionSchema),
    SubscriptionController.upgradeSubscription
);

// Get invoices
router.get(
    '/invoices',
    auth(USER_ROLES.EMPLOYER),
    SubscriptionController.getInvoices
);

// Get billing portal URL
router.get(
    '/billing-portal',
    auth(USER_ROLES.EMPLOYER),
    SubscriptionController.getBillingPortal
);

export const SubscriptionRoutes = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIPE_WEBHOOK_EVENTS = exports.STRIPE_SUBSCRIPTION_STATUS = void 0;
var STRIPE_SUBSCRIPTION_STATUS;
(function (STRIPE_SUBSCRIPTION_STATUS) {
    STRIPE_SUBSCRIPTION_STATUS["ACTIVE"] = "active";
    STRIPE_SUBSCRIPTION_STATUS["TRIALING"] = "trialing";
    STRIPE_SUBSCRIPTION_STATUS["CANCELED"] = "canceled";
    STRIPE_SUBSCRIPTION_STATUS["INCOMPLETE"] = "incomplete";
    STRIPE_SUBSCRIPTION_STATUS["PAST_DUE"] = "past_due";
    STRIPE_SUBSCRIPTION_STATUS["UNPAID"] = "unpaid";
    STRIPE_SUBSCRIPTION_STATUS["INCOMPLETE_EXPIRED"] = "incomplete_expired";
    STRIPE_SUBSCRIPTION_STATUS["PAUSED"] = "paused";
})(STRIPE_SUBSCRIPTION_STATUS || (exports.STRIPE_SUBSCRIPTION_STATUS = STRIPE_SUBSCRIPTION_STATUS = {}));
exports.STRIPE_WEBHOOK_EVENTS = {
    CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
    INVOICE_PAID: 'invoice.paid',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
    CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
    CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
};

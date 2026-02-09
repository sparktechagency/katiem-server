"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const http_status_codes_1 = require("http-status-codes");
const stripe_service_1 = require("../stripe/stripe.service");
const subscription_service_1 = require("../subscription/subscription.service");
const subscription_constants_1 = require("../subscription/subscription.constants");
/**
 * Handle Stripe webhook events
 * This endpoint receives events from Stripe and processes them accordingly.
 *
 * IMPORTANT: This route must use express.raw() to receive the raw body
 * for signature verification.
 */
const handleStripeWebhook = async (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    console.log("INNNNNNNNNNNNNNNNNN", req.body);
    if (!signature || typeof signature !== 'string') {
        console.error('Webhook Error: Missing stripe-signature header');
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Missing stripe-signature header',
        });
        return;
    }
    let event;
    try {
        event = stripe_service_1.stripeService.constructWebhookEvent(req.body, signature);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
        return;
    }
    console.log(`Received Stripe webhook event: ${event.type}`);
    try {
        switch (event.type) {
            case subscription_constants_1.STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED: {
                const session = event.data.object;
                // Only process subscription checkouts
                if (session.mode === 'subscription' && session.payment_status === 'paid') {
                    await subscription_service_1.subscriptionService.createSubscriptionFromWebhook(session);
                    console.log(`Subscription created for session: ${session.id}`);
                }
                break;
            }
            case subscription_constants_1.STRIPE_WEBHOOK_EVENTS.INVOICE_PAID: {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                // Store invoice data - subscription is a string ID or Subscription object
                if (subscriptionId) {
                    await subscription_service_1.subscriptionService.handleInvoicePaid(invoice);
                    console.log(`Invoice paid: ${invoice.id}`);
                }
                break;
            }
            case subscription_constants_1.STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED: {
                const invoice = event.data.object;
                console.error(`Invoice payment failed: ${invoice.id}`);
                await subscription_service_1.subscriptionService.handleInvoicePaymentFailed(invoice);
                break;
            }
            case subscription_constants_1.STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED: {
                const subscription = event.data.object;
                await subscription_service_1.subscriptionService.handleSubscriptionUpdated(subscription);
                console.log(`Subscription updated: ${subscription.id}`);
                break;
            }
            case subscription_constants_1.STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED: {
                const subscription = event.data.object;
                await subscription_service_1.subscriptionService.handleSubscriptionDeleted(subscription);
                console.log(`Subscription deleted: ${subscription.id}`);
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        // Always return 200 to acknowledge receipt
        res.status(http_status_codes_1.StatusCodes.OK).json({ received: true });
    }
    catch (error) {
        console.error('Error processing webhook event:', error);
        // Still return 200 to prevent Stripe from retrying
        // Log the error for investigation
        res.status(http_status_codes_1.StatusCodes.OK).json({
            received: true,
            warning: 'Event received but processing encountered an error'
        });
    }
};
exports.handleStripeWebhook = handleStripeWebhook;

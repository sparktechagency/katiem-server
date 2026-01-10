import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { stripeService } from "../stripe/stripe.service";
import { subscriptionService } from "../subscription/subscription.service";
import { STRIPE_WEBHOOK_EVENTS } from "../subscription/subscription.constants";
import Stripe from "stripe";

/**
 * Handle Stripe webhook events
 * This endpoint receives events from Stripe and processes them accordingly.
 * 
 * IMPORTANT: This route must use express.raw() to receive the raw body
 * for signature verification.
 */
export const handleStripeWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const signature = req.headers['stripe-signature'];

    console.log("INNNNNNNNNNNNNNNNNN", req.body)

    if (!signature || typeof signature !== 'string') {
        console.error('Webhook Error: Missing stripe-signature header');
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Missing stripe-signature header',
        });
        return;
    }

    let event: Stripe.Event;

    try {
        event = stripeService.constructWebhookEvent(req.body, signature);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        });
        return;
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    try {
        switch (event.type) {
            case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED: {
                const session = event.data.object as Stripe.Checkout.Session;

                // Only process subscription checkouts
                if (session.mode === 'subscription' && session.payment_status === 'paid') {
                    await subscriptionService.createSubscriptionFromWebhook(session);
                    console.log(`Subscription created for session: ${session.id}`);
                }
                break;
            }

            case STRIPE_WEBHOOK_EVENTS.INVOICE_PAID: {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as any).subscription;

                // Store invoice data - subscription is a string ID or Subscription object
                if (subscriptionId) {
                    await subscriptionService.handleInvoicePaid(invoice);
                    console.log(`Invoice paid: ${invoice.id}`);
                }
                break;
            }

            case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED: {
                const invoice = event.data.object as Stripe.Invoice;
                console.error(`Invoice payment failed: ${invoice.id}`);
                await subscriptionService.handleInvoicePaymentFailed(invoice);
                break;
            }

            case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED: {
                const subscription = event.data.object as Stripe.Subscription;
                await subscriptionService.handleSubscriptionUpdated(subscription);
                console.log(`Subscription updated: ${subscription.id}`);
                break;
            }

            case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED: {
                const subscription = event.data.object as Stripe.Subscription;
                await subscriptionService.handleSubscriptionDeleted(subscription);
                console.log(`Subscription deleted: ${subscription.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Always return 200 to acknowledge receipt
        res.status(StatusCodes.OK).json({ received: true });

    } catch (error) {
        console.error('Error processing webhook event:', error);
        // Still return 200 to prevent Stripe from retrying
        // Log the error for investigation
        res.status(StatusCodes.OK).json({
            received: true,
            warning: 'Event received but processing encountered an error'
        });
    }
};

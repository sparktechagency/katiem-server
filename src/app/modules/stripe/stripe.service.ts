import Stripe from "stripe";
import { stripe } from "../../../config/stripe";
import config from "../../../config";
import { IPackage } from "../package/package.interface";

class StripeService {
    // ==================== PRODUCT METHODS ====================
    async createProduct(name: string, description?: string) {
        return await stripe.products.create({
            name: name,
            description: description || '',
            metadata: {
                type: name,
            }
        });
    }

    async updateProduct(productId: string, name: string, description?: string) {
        return await stripe.products.update(productId, {
            name: name,
            description: description || '',
            metadata: {
                type: name,
            }
        });
    }

    async deleteProduct(productId: string) {
        return await stripe.products.del(productId);
    }

    // ==================== PRICE METHODS ====================
    async createPrice(payload: IPackage) {
        console.log('createPrice payload:', payload);
        return await stripe.prices.create({
            product: payload.stripeProductId,
            currency: 'usd',
            unit_amount: Math.round(payload.regularPrice * 100),
            recurring: {
                interval: payload.interval || 'month',
            },
            metadata: {
                type: payload.type,
            }
        });
    }

    async deletePrice(priceId: string) {
        return await stripe.prices.update(priceId, {
            active: false,
        });
    }

    // ==================== COUPON METHODS ====================
    async createCoupon(id: string, percent: number) {
        return await stripe.coupons.create({
            id: id,
            percent_off: percent,
            duration: 'forever',
            name: `Global ${percent}% Off`,
        });
    }

    async deleteCoupon(couponId: string) {
        return await stripe.coupons.del(couponId);
    }

    async retrieveCoupon(couponId: string) {
        return await stripe.coupons.retrieve(couponId);
    }

    // ==================== CUSTOMER METHODS ====================
    async createCustomer(email: string, userId: string, name?: string) {
        return await stripe.customers.create({
            email,
            name: name || undefined,
            metadata: {
                userId,
            },
        });
    }

    async getCustomer(customerId: string) {
        return await stripe.customers.retrieve(customerId);
    }

    async getCustomerByEmail(email: string) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        return customers.data[0] || null;
    }

    // ==================== CHECKOUT SESSION METHODS ====================
    async createCheckoutSession(params: {
        customerId: string;
        priceId: string;
        couponId?: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    }) {
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            customer: params.customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
            subscription_data: params.couponId ? {
                metadata: params.metadata,
            } : undefined,
        };

        // Apply coupon/discount if provided
        if (params.couponId) {
            sessionParams.discounts = [{ coupon: params.couponId }];
        }

        return await stripe.checkout.sessions.create(sessionParams);
    }

    async getCheckoutSession(sessionId: string) {
        return await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer'],
        });
    }

    // ==================== SUBSCRIPTION METHODS ====================
    async getSubscription(subscriptionId: string) {
        return await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice', 'default_payment_method'],
        });
    }

    async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
        if (immediately) {
            return await stripe.subscriptions.cancel(subscriptionId);
        } else {
            return await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        }
    }

    async reactivateSubscription(subscriptionId: string) {
        return await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
    }

    async updateSubscription(subscriptionId: string, newPriceId: string) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        return await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                },
            ],
            proration_behavior: 'always_invoice', // Immediately charge/credit the difference
        });
    }

    // ==================== INVOICE METHODS ====================
    async listInvoices(customerId: string, limit: number = 10) {
        return await stripe.invoices.list({
            customer: customerId,
            limit,
            expand: ['data.subscription'],
        });
    }

    async getInvoice(invoiceId: string) {
        return await stripe.invoices.retrieve(invoiceId);
    }

    async getUpcomingInvoice(customerId: string, subscriptionId?: string) {
        try {
            return await stripe.invoices.createPreview({
                customer: customerId,
                subscription: subscriptionId,
            });
        } catch {
            // No upcoming invoice exists
            return null;
        }
    }

    // ==================== WEBHOOK METHODS ====================
    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
        if (!config.webhook_secret) {
            throw new Error('Webhook secret is not configured');
        }
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            config.webhook_secret
        );
    }

    // ==================== BILLING PORTAL ====================
    async createBillingPortalSession(customerId: string, returnUrl: string) {
        return await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }

    async getPlatformRevenue() {
        let revenue = 0;
        let hasMore = true;
        let startingAfter = undefined;

        while (hasMore) {
            const invoices: any = await stripe.invoices.list({
                limit: 100,
                status: 'paid', // only paid invoices = real revenue
                starting_after: startingAfter,
            });

            for (const inv of invoices.data) {
                revenue += inv.total; // total includes discounts, taxes, shipping
            }

            hasMore = invoices.has_more;
            if (hasMore) {
                startingAfter = invoices.data[invoices.data.length - 1].id;
            }
        }

        return {
            revenue,
            currency: 'usd',
            formatted: (revenue / 100).toFixed(2), // convert cents → dollars
        };
    }

    /**
     * Get monthly revenue data for a given year
     * Returns 12-month data with month name and revenue value
     */
    async getMonthlyRevenue(year: number) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue: { month: string, value: number }[] = months.map(month => ({ month, value: 0 }));

        // Calculate Unix timestamps for the year range
        const startOfYear = Math.floor(new Date(year, 0, 1).getTime() / 1000);
        const endOfYear = Math.floor(new Date(year + 1, 0, 1).getTime() / 1000);

        let hasMore = true;
        let startingAfter: string | undefined = undefined;

        while (hasMore) {
            const invoices: any = await stripe.invoices.list({
                limit: 100,
                status: 'paid',
                starting_after: startingAfter,
                created: {
                    gte: startOfYear,
                    lt: endOfYear,
                },
            });

            for (const inv of invoices.data) {
                const invoiceDate = new Date(inv.created * 1000);
                const monthIndex = invoiceDate.getMonth();
                monthlyRevenue[monthIndex].value += inv.total / 100; // Convert cents to dollars
            }

            hasMore = invoices.has_more;
            if (hasMore && invoices.data.length > 0) {
                startingAfter = invoices.data[invoices.data.length - 1].id;
            }
        }

        return monthlyRevenue;
    }

}

export const stripeService = new StripeService();

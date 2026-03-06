"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = void 0;
const stripe_1 = require("../../../config/stripe");
const config_1 = __importDefault(require("../../../config"));
class StripeService {
    // ==================== PRODUCT METHODS ====================
    async createProduct(name, description) {
        return await stripe_1.stripe.products.create({
            name: name,
            description: description || '',
            metadata: {
                type: name,
            }
        });
    }
    async updateProduct(productId, name, description) {
        return await stripe_1.stripe.products.update(productId, {
            name: name,
            description: description || '',
            metadata: {
                type: name,
            }
        });
    }
    async deleteProduct(productId) {
        return await stripe_1.stripe.products.del(productId);
    }
    // ==================== PRICE METHODS ====================
    async createPrice(payload) {
        console.log('createPrice payload:', payload);
        return await stripe_1.stripe.prices.create({
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
    async deletePrice(priceId) {
        return await stripe_1.stripe.prices.update(priceId, {
            active: false,
        });
    }
    // ==================== COUPON METHODS ====================
    async createCoupon(id, percent) {
        return await stripe_1.stripe.coupons.create({
            id: id,
            percent_off: percent,
            duration: 'forever',
            name: `Global ${percent}% Off`,
        });
    }
    async deleteCoupon(couponId) {
        return await stripe_1.stripe.coupons.del(couponId);
    }
    async retrieveCoupon(couponId) {
        return await stripe_1.stripe.coupons.retrieve(couponId);
    }
    // ==================== CUSTOMER METHODS ====================
    async createCustomer(email, userId, name) {
        return await stripe_1.stripe.customers.create({
            email,
            name: name || undefined,
            metadata: {
                userId,
            },
        });
    }
    async getCustomer(customerId) {
        return await stripe_1.stripe.customers.retrieve(customerId);
    }
    async getCustomerByEmail(email) {
        const customers = await stripe_1.stripe.customers.list({ email, limit: 1 });
        return customers.data[0] || null;
    }
    // ==================== CHECKOUT SESSION METHODS ====================
    async createCheckoutSession(params) {
        const sessionParams = {
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
        return await stripe_1.stripe.checkout.sessions.create(sessionParams);
    }
    async getCheckoutSession(sessionId) {
        return await stripe_1.stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer'],
        });
    }
    // ==================== SUBSCRIPTION METHODS ====================
    async getSubscription(subscriptionId) {
        return await stripe_1.stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice', 'default_payment_method'],
        });
    }
    async cancelSubscription(subscriptionId, immediately = false) {
        if (immediately) {
            return await stripe_1.stripe.subscriptions.cancel(subscriptionId);
        }
        else {
            return await stripe_1.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        }
    }
    async reactivateSubscription(subscriptionId) {
        return await stripe_1.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
    }
    async updateSubscription(subscriptionId, newPriceId) {
        const subscription = await stripe_1.stripe.subscriptions.retrieve(subscriptionId);
        return await stripe_1.stripe.subscriptions.update(subscriptionId, {
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
    async listInvoices(customerId, limit = 10) {
        return await stripe_1.stripe.invoices.list({
            customer: customerId,
            limit,
            expand: ['data.subscription'],
        });
    }
    async getInvoice(invoiceId) {
        return await stripe_1.stripe.invoices.retrieve(invoiceId);
    }
    async getUpcomingInvoice(customerId, subscriptionId) {
        try {
            return await stripe_1.stripe.invoices.createPreview({
                customer: customerId,
                subscription: subscriptionId,
            });
        }
        catch (_a) {
            // No upcoming invoice exists
            return null;
        }
    }
    // ==================== WEBHOOK METHODS ====================
    constructWebhookEvent(payload, signature) {
        if (!config_1.default.webhook_secret) {
            throw new Error('Webhook secret is not configured');
        }
        return stripe_1.stripe.webhooks.constructEvent(payload, signature, config_1.default.webhook_secret);
    }
    // ==================== BILLING PORTAL ====================
    async createBillingPortalSession(customerId, returnUrl) {
        return await stripe_1.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }
    async getPlatformRevenue() {
        let revenue = 0;
        let hasMore = true;
        let startingAfter = undefined;
        while (hasMore) {
            const invoices = await stripe_1.stripe.invoices.list({
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
    async getMonthlyRevenue(year) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = months.map(month => ({ month, value: 0 }));
        // Calculate Unix timestamps for the year range
        const startOfYear = Math.floor(new Date(year, 0, 1).getTime() / 1000);
        const endOfYear = Math.floor(new Date(year + 1, 0, 1).getTime() / 1000);
        let hasMore = true;
        let startingAfter = undefined;
        while (hasMore) {
            const invoices = await stripe_1.stripe.invoices.list({
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
exports.stripeService = new StripeService();

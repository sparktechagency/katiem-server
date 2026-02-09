"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const stripe_service_1 = require("../stripe/stripe.service");
const package_model_1 = require("../package/package.model");
const subscription_model_1 = require("./subscription.model");
const subscription_constants_1 = require("./subscription.constants");
const user_model_1 = require("../user/user.model");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const notificationHelper_1 = require("../../../helpers/notificationHelper");
const user_1 = require("../../../enum/user");
const BASE_URL = 'https://asad.binarybards.online';
/**
 * Create a Stripe checkout session for subscription
 */
const createCheckoutSession = async (userId, packageId, userEmail) => {
    // Validate package exists and is active
    const packageData = await package_model_1.Package.findById(packageId);
    if (!packageData || !packageData.isActive) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Package not found or inactive');
    }
    // Check if user already has an active subscription
    const existingSubscription = await subscription_model_1.Subscription.findOne({
        userId,
        status: {
            $in: [
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.TRIALING,
            ],
        },
    });
    if (existingSubscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You already have an active subscription. Please cancel or upgrade your existing subscription.');
    }
    // Get or create Stripe customer
    let stripeCustomer = await stripe_service_1.stripeService.getCustomerByEmail(userEmail);
    if (!stripeCustomer) {
        stripeCustomer = await stripe_service_1.stripeService.createCustomer(userEmail, userId);
    }
    // Create checkout session
    const session = await stripe_service_1.stripeService.createCheckoutSession({
        customerId: stripeCustomer.id,
        priceId: packageData.stripePriceId,
        couponId: packageData.stripeCouponId || undefined,
        successUrl: `${BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${BASE_URL}/subscription/cancel`,
        metadata: {
            userId,
            packageId,
            packageType: packageData.type,
        },
    });
    return {
        checkoutUrl: session.url,
        sessionId: session.id,
    };
};
/**
 * Create subscription in database after successful checkout (called from webhook)
 */
const createSubscriptionFromWebhook = async (session) => {
    const { userId, packageId, packageType } = session.metadata || {};
    if (!userId || !packageId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Missing metadata in checkout session');
    }
    const subscriptionId = session.subscription;
    const customerId = session.customer;
    // Get full subscription details from Stripe
    const stripeSubscription = await stripe_service_1.stripeService.getSubscription(subscriptionId);
    // Check if subscription already exists (idempotency)
    const existingSubscription = await subscription_model_1.Subscription.findOne({
        stripeSubscriptionId: subscriptionId,
    });
    if (existingSubscription) {
        return existingSubscription;
    }
    // Create subscription in database
    const subscription = await subscription_model_1.Subscription.create({
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        packageId,
        packageType: packageType || 'Unknown',
        status: stripeSubscription.status,
        price: stripeSubscription.items.data[0].price.unit_amount / 100,
        currency: stripeSubscription.currency,
        startDate: new Date(stripeSubscription.start_date * 1000),
        currentPeriodStart: stripeSubscription.items.data[0].current_period_start,
        currentPeriodEnd: stripeSubscription.items.data[0].current_period_end,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    });
    // Sync subscription data to user
    await syncUserSubscriptionData(userId, subscription);
    return subscription;
};
/**
 * Cancel a subscription
 */
const cancelSubscription = async (userId, immediate = false) => {
    const subscription = await subscription_model_1.Subscription.findOne({
        userId,
        status: {
            $in: [
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.TRIALING,
            ],
        },
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No active subscription found');
    }
    // Cancel in Stripe
    const updatedStripeSubscription = await stripe_service_1.stripeService.cancelSubscription(subscription.stripeSubscriptionId, immediate);
    // Update local subscription
    subscription.status =
        updatedStripeSubscription.status;
    subscription.cancelAtPeriodEnd =
        updatedStripeSubscription.cancel_at_period_end;
    if (immediate) {
        subscription.canceledAt = Math.floor(Date.now() / 1000);
    }
    await subscription.save();
    // Sync to user
    await syncUserSubscriptionData(userId, subscription);
    return {
        message: immediate
            ? 'Subscription canceled immediately'
            : 'Subscription will be canceled at the end of the billing period',
        subscription,
    };
};
/**
 * Reactivate a subscription that was scheduled to cancel
 */
const reactivateSubscription = async (userId) => {
    const subscription = await subscription_model_1.Subscription.findOne({
        userId,
        status: subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
        cancelAtPeriodEnd: true,
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No subscription found that is scheduled for cancellation');
    }
    // Reactivate in Stripe
    await stripe_service_1.stripeService.reactivateSubscription(subscription.stripeSubscriptionId);
    // Update local subscription
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();
    // Sync to user
    await syncUserSubscriptionData(userId, subscription);
    return {
        message: 'Subscription reactivated successfully',
        subscription,
    };
};
/**
 * Upgrade or downgrade subscription to a new package
 */
const upgradeSubscription = async (userId, newPackageId) => {
    const subscription = await subscription_model_1.Subscription.findOne({
        userId,
        status: {
            $in: [
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.TRIALING,
            ],
        },
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No active subscription found');
    }
    // Can't upgrade to the same package
    if (subscription.packageId === newPackageId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You are already on this package');
    }
    // Get new package
    const newPackage = await package_model_1.Package.findById(newPackageId);
    if (!newPackage || !newPackage.isActive) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'New package not found or inactive');
    }
    // Update subscription in Stripe (with immediate proration)
    const updatedStripeSubscription = await stripe_service_1.stripeService.updateSubscription(subscription.stripeSubscriptionId, newPackage.stripePriceId);
    // Update local subscription
    subscription.packageId = newPackageId;
    subscription.packageType = newPackage.type;
    subscription.price = newPackage.regularPrice;
    subscription.status =
        updatedStripeSubscription.status;
    subscription.currentPeriodStart =
        updatedStripeSubscription.items.data[0].current_period_start;
    subscription.currentPeriodEnd =
        updatedStripeSubscription.items.data[0].current_period_end;
    // Clear cancel flag if it was set
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();
    // Sync to user
    await syncUserSubscriptionData(userId, subscription);
    return {
        message: 'Subscription upgraded successfully',
        subscription,
    };
};
/**
 * Get user's current subscription
 */
const getUserSubscription = async (userId) => {
    const subscription = await subscription_model_1.Subscription.findOne({
        userId,
        status: {
            $in: [
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.TRIALING,
                subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.PAST_DUE,
            ],
        },
    })
        .select('-stripeCustomerId -stripeSubscriptionId')
        .populate({
        path: 'userId',
        select: 'subscription.isActive subscription.packageType subscription.status subscription.currentJobQuota subscription.currentBoostQuota subscription.currentBookingQuota subscription.currentPeriodEnd subscription.cancelAtPeriodEnd',
    })
        .populate('packageId')
        .sort({ createdAt: -1 });
    if (!subscription) {
        return;
    }
    return subscription;
};
/**
 * Get user's invoices
 */
const getUserInvoices = async (userId) => {
    const subscription = await subscription_model_1.Subscription.findOne({ userId }).sort({
        createdAt: -1,
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No subscription found');
    }
    // Get invoices from Stripe for real-time data
    const stripeInvoices = await stripe_service_1.stripeService.listInvoices(subscription.stripeCustomerId, 20);
    return stripeInvoices.data.map(invoice => {
        var _a;
        return ({
            invoiceId: invoice.id,
            invoiceUrl: invoice.hosted_invoice_url,
            invoicePdf: invoice.invoice_pdf,
            amountPaid: (invoice.amount_paid || 0) / 100,
            currency: invoice.currency,
            status: invoice.status,
            paidAt: (_a = invoice.status_transitions) === null || _a === void 0 ? void 0 : _a.paid_at,
            periodStart: invoice.period_start,
            periodEnd: invoice.period_end,
        });
    });
};
/**
 * Handle invoice.paid webhook event
 */
const handleInvoicePaid = async (invoice) => {
    var _a, _b;
    // Access subscription using bracket notation to handle Stripe type definitions
    const invoiceSubscription = invoice['subscription'];
    if (!invoiceSubscription)
        return;
    const subscriptionId = typeof invoiceSubscription === 'string'
        ? invoiceSubscription
        : invoiceSubscription.id;
    const subscription = await subscription_model_1.Subscription.findOne({
        stripeSubscriptionId: subscriptionId,
    });
    if (!subscription)
        return;
    // Add invoice to subscription
    const invoiceData = {
        invoiceId: invoice.id,
        invoiceUrl: invoice.hosted_invoice_url || undefined,
        invoicePdf: invoice.invoice_pdf || undefined,
        amountPaid: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency,
        paidAt: ((_a = invoice.status_transitions) === null || _a === void 0 ? void 0 : _a.paid_at) || Math.floor(Date.now() / 1000),
        status: invoice.status || 'paid',
    };
    // Check if invoice already exists (idempotency)
    const existingInvoice = (_b = subscription.invoices) === null || _b === void 0 ? void 0 : _b.find(inv => inv.invoiceId === invoice.id);
    if (!existingInvoice) {
        subscription.invoices = subscription.invoices || [];
        subscription.invoices.push(invoiceData);
        await subscription.save();
    }
    // Sync to user to reset quotas for the new period
    await syncUserSubscriptionData(subscription.userId, subscription);
    return subscription;
};
/**
 * Handle customer.subscription.updated webhook event
 */
const handleSubscriptionUpdated = async (stripeSubscription) => {
    const subscription = await subscription_model_1.Subscription.findOne({
        stripeSubscriptionId: stripeSubscription.id,
    });
    if (!subscription)
        return;
    // Update subscription fields
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodStart =
        stripeSubscription.items.data[0].current_period_start;
    subscription.currentPeriodEnd =
        stripeSubscription.items.data[0].current_period_end;
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    if (stripeSubscription.canceled_at) {
        subscription.canceledAt = stripeSubscription.canceled_at;
    }
    await subscription.save();
    // Sync to user
    await syncUserSubscriptionData(subscription.userId, subscription);
    return subscription;
};
/**
 * Handle customer.subscription.deleted webhook event
 */
const handleSubscriptionDeleted = async (stripeSubscription) => {
    const subscription = await subscription_model_1.Subscription.findOne({
        stripeSubscriptionId: stripeSubscription.id,
    });
    if (!subscription)
        return;
    subscription.status = subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.CANCELED;
    subscription.canceledAt = Math.floor(Date.now() / 1000);
    await subscription.save();
    // Clear user's subscription data
    await user_model_1.User.findByIdAndUpdate(subscription.userId, {
        subscription: {
            isActive: false,
            status: subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.CANCELED,
        },
    });
    return subscription;
};
/**
 * Sync subscription data to user model for quick access
 */
const syncUserSubscriptionData = async (userId, subscription) => {
    var _a, _b, _c, _d, _e, _f;
    const isActive = [
        subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
        subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.TRIALING,
    ].includes(subscription.status);
    //fetch package details
    const packageDetails = await package_model_1.Package.findById(subscription.packageId)
        .select('limits')
        .lean();
    await user_model_1.User.findByIdAndUpdate(userId, {
        subscription: {
            isActive,
            packageId: subscription.packageId,
            packageType: subscription.packageType,
            stripeCustomerId: subscription.stripeCustomerId,
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            status: subscription.status,
            currentJobQuota: ((_a = packageDetails === null || packageDetails === void 0 ? void 0 : packageDetails.limits) === null || _a === void 0 ? void 0 : _a.jobPostLimit) || 0,
            currentBoostQuota: ((_b = packageDetails === null || packageDetails === void 0 ? void 0 : packageDetails.limits) === null || _b === void 0 ? void 0 : _b.boostLimit) || 0,
            currentBookingQuota: ((_c = packageDetails === null || packageDetails === void 0 ? void 0 : packageDetails.limits) === null || _c === void 0 ? void 0 : _c.bookingLimit) || 0,
            currentPeriodEnd: subscription.currentPeriodEnd || 0,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        },
        availableJobQuota: ((_d = packageDetails === null || packageDetails === void 0 ? void 0 : packageDetails.limits) === null || _d === void 0 ? void 0 : _d.jobPostLimit) || 0,
        availableBoostQuota: ((_e = packageDetails === null || packageDetails === void 0 ? void 0 : packageDetails.limits) === null || _e === void 0 ? void 0 : _e.boostLimit) || 0,
        availableBookingQuota: ((_f = packageDetails === null || packageDetails === void 0 ? void 0 : packageDetails.limits) === null || _f === void 0 ? void 0 : _f.bookingLimit) || 0,
    });
};
/**
 * Handle invoice.payment_failed webhook event
 */
const handleInvoicePaymentFailed = async (invoice) => {
    const stripeSubscriptionId = invoice['subscription'];
    if (!stripeSubscriptionId)
        return;
    const subscription = await subscription_model_1.Subscription.findOne({
        stripeSubscriptionId,
    });
    if (!subscription)
        return;
    const user = await user_model_1.User.findById(subscription.userId);
    if (!user)
        return;
    // 1. Update subscription status in DB
    subscription.status = subscription_constants_1.STRIPE_SUBSCRIPTION_STATUS.PAST_DUE;
    await subscription.save();
    // 2. Sync to user (marks isActive as false)
    await syncUserSubscriptionData(user._id.toString(), subscription);
    // 3. Send notifications (In-app, Push, Email)
    // Find an admin user to be the 'from' sender for the notification
    const admin = await user_model_1.User.findOne({ role: user_1.USER_ROLES.ADMIN });
    const notificationPayload = {
        from: {
            authId: (admin === null || admin === void 0 ? void 0 : admin._id.toString()) || user._id.toString(), // Fallback to user themselves if no admin found
            name: (admin === null || admin === void 0 ? void 0 : admin.name) || 'System',
            profile: (admin === null || admin === void 0 ? void 0 : admin.profile) || '',
        },
        to: user._id.toString(),
        title: 'Payment Failed',
        body: `We were unable to process the payment for your ${subscription.packageType} subscription. Please update your payment method.`,
        deviceToken: user.deviceToken,
    };
    await (0, notificationHelper_1.sendNotification)(notificationPayload.from, notificationPayload.to, notificationPayload.title, notificationPayload.body, notificationPayload.deviceToken);
    // 4. Send email notification
    const emailData = emailTemplate_1.emailTemplate.paymentFailed({
        name: user.name || 'User',
        email: user.email,
        amount: (invoice.amount_due || 0) / 100,
        packageType: subscription.packageType,
    });
    emailHelper_1.emailHelper.sendEmail(emailData);
    return subscription;
};
/**
 * Get billing portal URL for self-service management
 */
const getBillingPortalUrl = async (userId) => {
    const subscription = await subscription_model_1.Subscription.findOne({ userId }).sort({
        createdAt: -1,
    });
    if (!subscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No subscription found');
    }
    const session = await stripe_service_1.stripeService.createBillingPortalSession(subscription.stripeCustomerId, `${BASE_URL}/subscription`);
    return { url: session.url };
};
exports.subscriptionService = {
    createCheckoutSession,
    createSubscriptionFromWebhook,
    cancelSubscription,
    reactivateSubscription,
    upgradeSubscription,
    getUserSubscription,
    getUserInvoices,
    handleInvoicePaid,
    handleSubscriptionUpdated,
    handleSubscriptionDeleted,
    handleInvoicePaymentFailed,
    syncUserSubscriptionData,
    getBillingPortalUrl,
};

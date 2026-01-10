import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiError'
import { stripeService } from '../stripe/stripe.service'
import { Package } from '../package/package.model'
import { Subscription } from './subscription.model'
import { STRIPE_SUBSCRIPTION_STATUS } from './subscription.constants'
import { User } from '../user/user.model'
import { ISubscription } from './subscription.interface'
import Stripe from 'stripe'
import { Types } from 'mongoose'
import { NotificationServices } from '../notifications/notifications.service'
import { emailTemplate } from '../../../shared/emailTemplate'
import { emailHelper } from '../../../helpers/emailHelper'
import { sendNotification } from '../../../helpers/notificationHelper'
import { USER_ROLES } from '../../../enum/user'

const BASE_URL = 'https://asad.binarybards.online'

/**
 * Create a Stripe checkout session for subscription
 */
const createCheckoutSession = async (
  userId: string,
  packageId: string,
  userEmail: string,
) => {
  // Validate package exists and is active
  const packageData = await Package.findById(packageId)
  if (!packageData || !packageData.isActive) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found or inactive')
  }

  // Check if user already has an active subscription
  const existingSubscription = await Subscription.findOne({
    userId,
    status: {
      $in: [
        STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
        STRIPE_SUBSCRIPTION_STATUS.TRIALING,
      ],
    },
  })

  if (existingSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You already have an active subscription. Please cancel or upgrade your existing subscription.',
    )
  }

  // Get or create Stripe customer
  let stripeCustomer = await stripeService.getCustomerByEmail(userEmail)
  if (!stripeCustomer) {
    stripeCustomer = await stripeService.createCustomer(userEmail, userId)
  }

  // Create checkout session
  const session = await stripeService.createCheckoutSession({
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
  })

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  }
}

/**
 * Create subscription in database after successful checkout (called from webhook)
 */
const createSubscriptionFromWebhook = async (
  session: Stripe.Checkout.Session,
) => {
  const { userId, packageId, packageType } = session.metadata || {}

  if (!userId || !packageId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Missing metadata in checkout session',
    )
  }

  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Get full subscription details from Stripe
  const stripeSubscription = await stripeService.getSubscription(subscriptionId)

  // Check if subscription already exists (idempotency)
  const existingSubscription = await Subscription.findOne({
    stripeSubscriptionId: subscriptionId,
  })
  if (existingSubscription) {
    return existingSubscription
  }

  // Create subscription in database
  const subscription = await Subscription.create({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    packageId,
    packageType: packageType || 'Unknown',
    status: stripeSubscription.status as STRIPE_SUBSCRIPTION_STATUS,
    price: stripeSubscription.items.data[0].price.unit_amount! / 100,
    currency: stripeSubscription.currency,
    startDate: new Date(stripeSubscription.start_date * 1000),
    currentPeriodStart: stripeSubscription.items.data[0].current_period_start,
    currentPeriodEnd: stripeSubscription.items.data[0].current_period_end,
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
  })

  // Sync subscription data to user
  await syncUserSubscriptionData(userId, subscription)

  return subscription
}

/**
 * Cancel a subscription
 */
const cancelSubscription = async (
  userId: string,
  immediate: boolean = false,
) => {
  const subscription = await Subscription.findOne({
    userId,
    status: {
      $in: [
        STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
        STRIPE_SUBSCRIPTION_STATUS.TRIALING,
      ],
    },
  })

  if (!subscription) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No active subscription found')
  }

  // Cancel in Stripe
  const updatedStripeSubscription = await stripeService.cancelSubscription(
    subscription.stripeSubscriptionId,
    immediate,
  )

  // Update local subscription
  subscription.status =
    updatedStripeSubscription.status as STRIPE_SUBSCRIPTION_STATUS
  subscription.cancelAtPeriodEnd =
    updatedStripeSubscription.cancel_at_period_end
  if (immediate) {
    subscription.canceledAt = Math.floor(Date.now() / 1000)
  }
  await subscription.save()

  // Sync to user
  await syncUserSubscriptionData(userId, subscription)

  return {
    message: immediate
      ? 'Subscription canceled immediately'
      : 'Subscription will be canceled at the end of the billing period',
    subscription,
  }
}

/**
 * Reactivate a subscription that was scheduled to cancel
 */
const reactivateSubscription = async (userId: string) => {
  const subscription = await Subscription.findOne({
    userId,
    status: STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
    cancelAtPeriodEnd: true,
  })

  if (!subscription) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No subscription found that is scheduled for cancellation',
    )
  }

  // Reactivate in Stripe
  await stripeService.reactivateSubscription(subscription.stripeSubscriptionId)

  // Update local subscription
  subscription.cancelAtPeriodEnd = false
  await subscription.save()

  // Sync to user
  await syncUserSubscriptionData(userId, subscription)

  return {
    message: 'Subscription reactivated successfully',
    subscription,
  }
}

/**
 * Upgrade or downgrade subscription to a new package
 */
const upgradeSubscription = async (userId: string, newPackageId: string) => {
  const subscription = await Subscription.findOne({
    userId,
    status: {
      $in: [
        STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
        STRIPE_SUBSCRIPTION_STATUS.TRIALING,
      ],
    },
  })

  if (!subscription) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No active subscription found')
  }

  // Can't upgrade to the same package
  if (subscription.packageId === newPackageId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are already on this package',
    )
  }

  // Get new package
  const newPackage = await Package.findById(newPackageId)
  if (!newPackage || !newPackage.isActive) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'New package not found or inactive',
    )
  }

  // Update subscription in Stripe (with immediate proration)
  const updatedStripeSubscription = await stripeService.updateSubscription(
    subscription.stripeSubscriptionId,
    newPackage.stripePriceId,
  )

  // Update local subscription
  subscription.packageId = newPackageId
  subscription.packageType = newPackage.type
  subscription.price = newPackage.regularPrice
  subscription.status =
    updatedStripeSubscription.status as STRIPE_SUBSCRIPTION_STATUS
  subscription.currentPeriodStart =
    updatedStripeSubscription.items.data[0].current_period_start
  subscription.currentPeriodEnd =
    updatedStripeSubscription.items.data[0].current_period_end
  // Clear cancel flag if it was set
  subscription.cancelAtPeriodEnd = false
  await subscription.save()

  // Sync to user
  await syncUserSubscriptionData(userId, subscription)

  return {
    message: 'Subscription upgraded successfully',
    subscription,
  }
}

/**
 * Get user's current subscription
 */
const getUserSubscription = async (userId: string) => {
  const subscription = await Subscription.findOne({
    userId,
    status: {
      $in: [
        STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
        STRIPE_SUBSCRIPTION_STATUS.TRIALING,
        STRIPE_SUBSCRIPTION_STATUS.PAST_DUE,
      ],
    },
  })
    .select(
      '-stripeCustomerId -stripeSubscriptionId',
    )
    .populate({
      path: 'userId',
      select:
        'subscription.isActive subscription.packageType subscription.status subscription.currentJobQuota subscription.currentBoostQuota subscription.currentBookingQuota subscription.currentPeriodEnd subscription.cancelAtPeriodEnd',
    })
    .populate('packageId')
    .sort({ createdAt: -1 })

  if (!subscription) {
    return
  }

  return subscription
}

/**
 * Get user's invoices
 */
const getUserInvoices = async (userId: string) => {
  const subscription = await Subscription.findOne({ userId }).sort({
    createdAt: -1,
  })

  if (!subscription) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No subscription found')
  }

  // Get invoices from Stripe for real-time data
  const stripeInvoices = await stripeService.listInvoices(
    subscription.stripeCustomerId,
    20,
  )

  return stripeInvoices.data.map(invoice => ({
    invoiceId: invoice.id,
    invoiceUrl: invoice.hosted_invoice_url,
    invoicePdf: invoice.invoice_pdf,
    amountPaid: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency,
    status: invoice.status,
    paidAt: invoice.status_transitions?.paid_at,
    periodStart: invoice.period_start,
    periodEnd: invoice.period_end,
  }))
}

/**
 * Handle invoice.paid webhook event
 */
const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  // Access subscription using bracket notation to handle Stripe type definitions
  const invoiceSubscription = (invoice as unknown as Record<string, unknown>)[
    'subscription'
  ]
  if (!invoiceSubscription) return

  const subscriptionId =
    typeof invoiceSubscription === 'string'
      ? invoiceSubscription
      : (invoiceSubscription as Stripe.Subscription).id

  const subscription = await Subscription.findOne({
    stripeSubscriptionId: subscriptionId,
  })
  if (!subscription) return

  // Add invoice to subscription
  const invoiceData = {
    invoiceId: invoice.id,
    invoiceUrl: invoice.hosted_invoice_url || undefined,
    invoicePdf: invoice.invoice_pdf || undefined,
    amountPaid: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency,
    paidAt:
      invoice.status_transitions?.paid_at || Math.floor(Date.now() / 1000),
    status: invoice.status || 'paid',
  }

  // Check if invoice already exists (idempotency)
  const existingInvoice = subscription.invoices?.find(
    inv => inv.invoiceId === invoice.id,
  )
  if (!existingInvoice) {
    subscription.invoices = subscription.invoices || []
    subscription.invoices.push(invoiceData)
    await subscription.save()
  }

  // Sync to user to reset quotas for the new period
  await syncUserSubscriptionData(subscription.userId, subscription)

  return subscription
}

/**
 * Handle customer.subscription.updated webhook event
 */
const handleSubscriptionUpdated = async (
  stripeSubscription: Stripe.Subscription,
) => {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id,
  })

  if (!subscription) return

  // Update subscription fields
  subscription.status = stripeSubscription.status as STRIPE_SUBSCRIPTION_STATUS
  subscription.currentPeriodStart =
    stripeSubscription.items.data[0].current_period_start
  subscription.currentPeriodEnd =
    stripeSubscription.items.data[0].current_period_end
  subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end

  if (stripeSubscription.canceled_at) {
    subscription.canceledAt = stripeSubscription.canceled_at
  }

  await subscription.save()

  // Sync to user
  await syncUserSubscriptionData(subscription.userId, subscription)

  return subscription
}

/**
 * Handle customer.subscription.deleted webhook event
 */
const handleSubscriptionDeleted = async (
  stripeSubscription: Stripe.Subscription,
) => {
  const subscription = await Subscription.findOne({
    stripeSubscriptionId: stripeSubscription.id,
  })

  if (!subscription) return

  subscription.status = STRIPE_SUBSCRIPTION_STATUS.CANCELED
  subscription.canceledAt = Math.floor(Date.now() / 1000)
  await subscription.save()

  // Clear user's subscription data
  await User.findByIdAndUpdate(subscription.userId, {
    subscription: {
      isActive: false,
      status: STRIPE_SUBSCRIPTION_STATUS.CANCELED,
    },
  })

  return subscription
}

/**
 * Sync subscription data to user model for quick access
 */
const syncUserSubscriptionData = async (
  userId: string,
  subscription: ISubscription,
) => {
  const isActive = [
    STRIPE_SUBSCRIPTION_STATUS.ACTIVE,
    STRIPE_SUBSCRIPTION_STATUS.TRIALING,
  ].includes(subscription.status)

  //fetch package details
  const packageDetails = await Package.findById(subscription.packageId)
    .select('limits')
    .lean()

  await User.findByIdAndUpdate(userId, {
    subscription: {
      isActive,
      packageId: subscription.packageId,
      packageType: subscription.packageType,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      currentJobQuota: packageDetails?.limits?.jobPostLimit || 0,
      currentBoostQuota: packageDetails?.limits?.boostLimit || 0,
      currentBookingQuota: packageDetails?.limits?.bookingLimit || 0,
      currentPeriodEnd: subscription.currentPeriodEnd || 0,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    },
    availableJobQuota: packageDetails?.limits?.jobPostLimit || 0,
    availableBoostQuota: packageDetails?.limits?.boostLimit || 0,
    availableBookingQuota: packageDetails?.limits?.bookingLimit || 0,
  })
}

/**
 * Handle invoice.payment_failed webhook event
 */
const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const stripeSubscriptionId = (invoice as unknown as Record<string, unknown>)[
    'subscription'
  ] as string
  if (!stripeSubscriptionId) return

  const subscription = await Subscription.findOne({
    stripeSubscriptionId,
  })
  if (!subscription) return

  const user = await User.findById(subscription.userId)
  if (!user) return

  // 1. Update subscription status in DB
  subscription.status = STRIPE_SUBSCRIPTION_STATUS.PAST_DUE
  await subscription.save()

  // 2. Sync to user (marks isActive as false)
  await syncUserSubscriptionData(user._id.toString(), subscription)

  // 3. Send notifications (In-app, Push, Email)
  // Find an admin user to be the 'from' sender for the notification
  const admin = await User.findOne({ role: USER_ROLES.ADMIN })

  const notificationPayload = {
    from: {
      authId: admin?._id.toString() || user._id.toString(), // Fallback to user themselves if no admin found
      name: admin?.name || 'System',
      profile: admin?.profile || '',
    },
    to: user._id.toString(),
    title: 'Payment Failed',
    body: `We were unable to process the payment for your ${subscription.packageType} subscription. Please update your payment method.`,
    deviceToken: user.deviceToken,
  }

  await sendNotification(
    notificationPayload.from,
    notificationPayload.to,
    notificationPayload.title,
    notificationPayload.body,
    notificationPayload.deviceToken,
  )

  // 4. Send email notification
  const emailData = emailTemplate.paymentFailed({
    name: user.name || 'User',
    email: user.email!,
    amount: (invoice.amount_due || 0) / 100,
    packageType: subscription.packageType,
  })

  emailHelper.sendEmail(emailData)

  return subscription
}

/**
 * Get billing portal URL for self-service management
 */
const getBillingPortalUrl = async (userId: string) => {
  const subscription = await Subscription.findOne({ userId }).sort({
    createdAt: -1,
  })

  if (!subscription) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No subscription found')
  }

  const session = await stripeService.createBillingPortalSession(
    subscription.stripeCustomerId,
    `${BASE_URL}/subscription`,
  )

  return { url: session.url }
}

export const subscriptionService = {
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
}

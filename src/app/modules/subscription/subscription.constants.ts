export enum STRIPE_SUBSCRIPTION_STATUS {
    ACTIVE = 'active',
    TRIALING = 'trialing',
    CANCELED = 'canceled',
    INCOMPLETE = 'incomplete',
    PAST_DUE = 'past_due',
    UNPAID = 'unpaid',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    PAUSED = 'paused',
}

export const STRIPE_WEBHOOK_EVENTS = {
    CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
    INVOICE_PAID: 'invoice.paid',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
    CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
    CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
} as const;
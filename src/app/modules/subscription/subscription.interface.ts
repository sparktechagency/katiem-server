import { Model, Types } from "mongoose";
import { STRIPE_SUBSCRIPTION_STATUS } from "./subscription.constants";

export interface IInvoice {
    invoiceId: string;
    invoiceUrl?: string;
    invoicePdf?: string;
    amountPaid: number;
    currency: string;
    paidAt: number;
    status: string;
}

export interface ISubscription extends Document {
    _id: Types.ObjectId;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    packageId: string;
    packageType: string;
    status: STRIPE_SUBSCRIPTION_STATUS;
    price: number;
    currency: string;
    startDate: Date;
    currentPeriodStart: number;
    currentPeriodEnd: number;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: number;
    invoices?: IInvoice[];
    createdAt: Date;
    updatedAt: Date;
}

export type ISubscriptionModel = Model<ISubscription, {}, {}>;

export interface ICreateCheckoutPayload {
    userId: string;
    packageId: string;
    userEmail: string;
}

export interface ISubscriptionQueryParams {
    userId?: string;
    status?: STRIPE_SUBSCRIPTION_STATUS;
    packageId?: string;
}

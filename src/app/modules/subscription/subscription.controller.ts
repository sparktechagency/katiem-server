import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { subscriptionService } from "./subscription.service";
import { JwtPayload } from "jsonwebtoken";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const { packageId } = req.params;
    console.log(packageId);
    const userId = (req.user as JwtPayload).authId;
    const userEmail = (req.user as JwtPayload).email;

    const result = await subscriptionService.createCheckoutSession(userId, packageId, userEmail);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Checkout session created successfully',
        data: result,
    });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const { immediate = false } = req.body;
    const userId = (req.user as JwtPayload).authId;

    const result = await subscriptionService.cancelSubscription(userId, immediate);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});

const reactivateSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).authId;

    const result = await subscriptionService.reactivateSubscription(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});

const upgradeSubscription = catchAsync(async (req: Request, res: Response) => {
    const { packageId } = req.body;
    const userId = (req.user as JwtPayload).authId;

    const result = await subscriptionService.upgradeSubscription(userId, packageId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).authId;

    const result = await subscriptionService.getUserSubscription(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result ? 'Subscription retrieved successfully' : 'No active subscription found',
        data: result,
    });
});

const getInvoices = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).authId;

    const result = await subscriptionService.getUserInvoices(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Invoices retrieved successfully',
        data: result,
    });
});

const getBillingPortal = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).authId;

    const result = await subscriptionService.getBillingPortalUrl(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Billing portal URL generated successfully',
        data: result,
    });
});

export const SubscriptionController = {
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    upgradeSubscription,
    getMySubscription,
    getInvoices,
    getBillingPortal,
};

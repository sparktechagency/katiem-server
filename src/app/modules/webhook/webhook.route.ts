import { Router } from "express";
import express from "express";
import { handleStripeWebhook } from "./webhook.controller";

const router = Router();

router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
);

export const WebhookRoutes = router;

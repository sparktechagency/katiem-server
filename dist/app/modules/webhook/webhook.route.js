"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRoutes = void 0;
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const webhook_controller_1 = require("./webhook.controller");
const router = (0, express_1.Router)();
router.post('/stripe', express_2.default.raw({ type: 'application/json' }), webhook_controller_1.handleStripeWebhook);
exports.WebhookRoutes = router;

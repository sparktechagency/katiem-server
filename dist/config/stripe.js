"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const _1 = __importDefault(require("."));
if (!_1.default.stripe_secret) {
    throw new Error('Stripe secret key is not defined');
}
exports.stripe = new stripe_1.default(_1.default.stripe_secret, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
});

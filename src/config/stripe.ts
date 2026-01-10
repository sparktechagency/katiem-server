import Stripe from 'stripe';
import config from '.';

if (!config.stripe_secret) {
    throw new Error('Stripe secret key is not defined');
}

export const stripe = new Stripe(config.stripe_secret as string, {
    apiVersion: '2025-11-17.clover',
    typescript: true,
});


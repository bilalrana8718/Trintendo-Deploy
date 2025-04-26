import express from 'express';
import { createCheckoutSession, handleWebhookEvent } from '../controllers/payment.controller.js';
import customerAuth from '../middleware/customer.middleware.js';

const router = express.Router();

// Create a Stripe checkout session
router.post('/create-checkout-session', customerAuth, createCheckoutSession);

// Handle Stripe webhook events - use raw body parser for webhooks
router.post(
  '/webhook', 
  express.raw({ type: 'application/json' }), 
  handleWebhookEvent
);

export default router; 
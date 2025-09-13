import { Router } from 'express';
import { createCheckoutSession, handleWebhook, getCurrentSubscription, cancelSubscription } from '../controllers/subscription.controller.js';
import { protect } from '../middlewares/auth.js';
import express from 'express';

const subscriptionRouter = Router();

// Protected routes - require authentication
// Simplified for the assignment - only essential endpoints
subscriptionRouter.post('/pro', protect, createCheckoutSession); // Simplified endpoint for upgrading to Pro
subscriptionRouter.get('/current', protect, getCurrentSubscription);
subscriptionRouter.post('/cancel', protect, cancelSubscription);

// Webhook route - no authentication, raw body needed for Stripe signature verification
subscriptionRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

export default subscriptionRouter;
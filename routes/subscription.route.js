import { Router } from "express";
import { getCurrentSubscription } from "../controllers/subscription.controller.js";
import { auth } from "../middlewares/auth.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/status", auth, getCurrentSubscription);

// Webhook route - no authentication, raw body needed for Stripe signature verification
// subscriptionRouter.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   handleWebhook
// );

export default subscriptionRouter;

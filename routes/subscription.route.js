import { Router } from "express";
import { getCurrentSubscription } from "../controllers/subscription.controller.js";

import { auth } from "../middlewares/auth.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/status", auth, getCurrentSubscription);

export default subscriptionRouter;

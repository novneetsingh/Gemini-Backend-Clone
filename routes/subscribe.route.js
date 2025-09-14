import { Router } from "express";
import { createSubscribeSession } from "../controllers/subscribe.controller.js";
import { auth } from "../middlewares/auth.js";

const subscribeRouter = Router();

subscribeRouter.post("/pro", auth, createSubscribeSession);

export default subscribeRouter;

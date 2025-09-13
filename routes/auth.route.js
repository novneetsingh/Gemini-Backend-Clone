import { Router } from "express";
import {
  register,
  sendOtp,
  verifyOtp,
  forgotPassword,
  changePassword,
} from "../controllers/auth.controller.js";

import { auth } from "../middlewares/auth.js";

const authRouter = Router();

// Auth routes
authRouter.post("/signup", register);
authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/change-password", auth, changePassword);

export default authRouter;

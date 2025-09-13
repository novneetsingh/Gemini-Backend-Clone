import { Router } from "express";
import { getMe } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.js";

const userRouter = Router();

userRouter.get("/me", auth, getMe);

export default userRouter;

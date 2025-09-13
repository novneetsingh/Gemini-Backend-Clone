import { Router } from "express";
import { createChatMessage, getChatHistory, deleteChat, checkChatStatus } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.js";

const chatRouter = Router();

// Chat routes - all protected by auth middleware
chatRouter.post("/", protect, createChatMessage);
chatRouter.get("/history", protect, getChatHistory);
chatRouter.get("/status/:jobId", protect, checkChatStatus);
chatRouter.delete("/:id", protect, deleteChat);

export default chatRouter;
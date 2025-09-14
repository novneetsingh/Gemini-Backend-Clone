import { Router } from "express";
import {
  createChatroom,
  getChatrooms,
  getChatroomById,
  chatWithAI,
} from "../controllers/chat.controller.js";
import { auth } from "../middlewares/auth.js";

const chatRoomRouter = Router();

chatRoomRouter.route("/").post(auth, createChatroom).get(auth, getChatrooms);
chatRoomRouter.get("/:id", auth, getChatroomById);
chatRoomRouter.post("/:id/message", auth, chatWithAI);

export default chatRoomRouter;

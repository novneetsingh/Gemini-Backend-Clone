import { Router } from "express";
import {
  createChatroom,
  getChatrooms,
  getChatroomById,
} from "../controllers/chat.controller.js";
import { auth } from "../middlewares/auth.js";

const chatRoomRouter = Router();

chatRoomRouter.post("/", auth, createChatroom).get("/", auth, getChatrooms);
chatRoomRouter.get("/:id", auth, getChatroomById);

export default chatRoomRouter;

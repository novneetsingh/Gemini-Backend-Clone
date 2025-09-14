import { prisma } from "../config/prisma.js";
import { redis } from "../config/redis.js";
import { chatQueue, queueEvents } from "../config/bullmq.js";

// create a chatroom
export const createChatroom = async (req, res) => {
  try {
    // find the user
    const user = await prisma.User.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // create a new chatroom
    const chatroom = await prisma.Chatroom.create({
      data: {
        userId: user.id,
      },
    });

    // create a cache key
    const cacheKey = `user:${req.user.id}:chatrooms`;

    // delete the cached chatrooms for the user
    await redis.del(cacheKey);

    res.status(201).json({
      success: true,
      message: "Chatroom created successfully",
      data: chatroom,
    });
  } catch (error) {
    console.error("Error creating chatroom:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all chatrooms for a user
export const getChatrooms = async (req, res) => {
  try {
    // create a cache key
    const cacheKey = `user:${req.user.id}:chatrooms`;

    // check if chatrooms are in cache
    let cachedChatrooms = await redis.get(cacheKey);

    if (cachedChatrooms) {
      cachedChatrooms = JSON.parse(cachedChatrooms);

      return res.status(200).json({
        success: true,
        message: "Chatrooms fetched successfully",
        count: cachedChatrooms.length,
        data: cachedChatrooms,
      });
    }

    // find the user
    const chatrooms = await prisma.Chatroom.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: "desc" },
    });

    // add chatrooms to cache for 10 minutes
    if (chatrooms) {
      await redis.setex(cacheKey, 60 * 10, JSON.stringify(chatrooms));
    }

    res.status(200).json({
      success: chatrooms ? true : false,
      message: chatrooms ? "Chatrooms fetched successfully" : "User not found",
      count: chatrooms ? chatrooms.length : 0,
      data: chatrooms ? chatrooms : [],
    });
  } catch (error) {
    console.error("Error getting chatrooms:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// get a single chatroom by id
export const getChatroomById = async (req, res) => {
  try {
    const { id } = req.params;

    // find the chatroom
    const chatroom = await prisma.Chatroom.findFirst({
      where: { id: parseInt(id), userId: req.user.id },
    });

    res.status(200).json({
      success: chatroom ? true : false,
      message: chatroom
        ? "Chatroom fetched successfully"
        : "Chatroom not found",
      data: chatroom ? chatroom : null,
    });
  } catch (error) {
    console.error("Error getting chatroom:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// chat with AI in a chatroom
export const chatWithAI = async (req, res) => {
  try {
    const { id } = req.params; // chatroom id
    const { message } = req.body;

    // find the chatroom
    const chatroom = await prisma.Chatroom.findFirst({
      where: { id: parseInt(id), userId: req.user.id },
    });

    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: "Chatroom not found",
      });
    }

    // Create a new job and get its promise
    const job = await chatQueue.add("process-chat", {
      currentMessage: message.trim(),
      chatHistory: chatroom.messages, // Pass existing messages for context
    });

    // Wait for job to complete
    const aiResponse = await job.waitUntilFinished(queueEvents);

    const newMessages = [
      {
        role: "User",
        text: message.trim(),
        timestamp: new Date().toISOString(),
      },
      {
        role: "AI",
        text: aiResponse,
        timestamp: new Date().toISOString(),
      },
    ];

    // Update chatroom with both messages in one call
    await prisma.Chatroom.update({
      where: { id: parseInt(id), userId: req.user.id },
      data: {
        messages: {
          set: [...chatroom.messages, ...newMessages],
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Chat processed successfully",
      data: aiResponse,
    });
  } catch (error) {
    console.error("Error chatting with AI:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

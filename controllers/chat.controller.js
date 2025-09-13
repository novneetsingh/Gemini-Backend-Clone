import { model } from "../config/geminiAI.js";
import { prisma } from "../config/prisma.js";
import { redis } from "../config/redis.js";
import { chatQueue } from "../config/bullmq.js";

// Create a new chat message
export const createChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get user to check tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check rate limits based on user tier
    const rateLimitKey = `rateLimit:${userId}`;
    const currentRequests = await redis.get(rateLimitKey) || 0;

    // Set rate limits based on tier
    const rateLimit = user.tier === "Pro" ? 50 : 10; // Pro: 50 requests/hour, Basic: 10 requests/hour
    
    if (parseInt(currentRequests) >= rateLimit) {
      return res.status(429).json({ 
        message: "Rate limit exceeded. Please upgrade your plan or try again later.",
        currentTier: user.tier,
        rateLimit
      });
    }

    // Increment rate limit counter
    await redis.incr(rateLimitKey);
    // Set expiry if not already set
    await redis.expire(rateLimitKey, 3600); // 1 hour

    // Add job to queue for processing
    const job = await chatQueue.add('process-chat', {
      userId,
      message,
    });

    // Return job ID to client for tracking
    res.status(202).json({
      message: "Chat message queued for processing",
      jobId: job.id,
      status: "processing"
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check status of a chat job
export const checkChatStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job from queue
    const job = await chatQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Get job state
    const state = await job.getState();
    
    // If job is completed, get the chat from database
    if (state === 'completed') {
      const result = job.returnvalue;
      
      if (result && result.chatId) {
        const chat = await prisma.chat.findUnique({
          where: { id: result.chatId },
        });
        
        if (chat) {
          return res.json({
            status: state,
            chat: {
              id: chat.id,
              userMessage: chat.userMessage,
              aiResponse: chat.aiResponse,
              createdAt: chat.createdAt,
            },
          });
        }
      }
    }
    
    // Return job status
    res.json({
      status: state,
      jobId,
    });
  } catch (error) {
    console.error("Check chat status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get chat history for a user
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalChats = await prisma.chat.count({
      where: { userId },
    });

    res.json({
      chats,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalChats / limit),
        totalChats,
      },
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a chat message
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if chat exists and belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Delete chat
    await prisma.chat.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
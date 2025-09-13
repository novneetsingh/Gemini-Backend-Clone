import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { model } from "../config/geminiAI.js";
import { prisma } from "../config/prisma.js";

// Create worker to process chat messages
const chatWorker = new Worker(
  "chat-processing",
  async (job) => {
    try {
      const { userId, message } = job.data;

      console.log(`Processing chat message for user ${userId}`);

      // Generate response from Gemini AI
      const result = await model.generateContent(message);
      const response = await result.response;
      const aiResponse = response.text();

      // Store chat in database
      const chat = await prisma.chat.create({
        data: {
          userId,
          userMessage: message,
          aiResponse,
        },
      });

      console.log(`Chat processed successfully: ${chat.id}`);
      return { success: true, chatId: chat.id };
    } catch (error) {
      console.error("Error processing chat:", error);
      throw new Error(`Failed to process chat: ${error.message}`);
    }
  },
  { connection: redis }
);

// Handle worker events
chatWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

chatWorker.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed with error: ${error.message}`);
});

export default chatWorker;
import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { model } from "../config/geminiAI.js";

// Create worker to process chat messages
export const chatWorker = () => {
  console.log("Chat worker started...");

  new Worker(
    "chat-processing",
    async (job) => {
      try {
        const { currentMessage, chatHistory } = job.data;

        // Format chat history for the prompt
        const formattedHistory = chatHistory
          .map((entry) => `Role: ${entry.role}\nMessage: ${entry.text}`)
          .join("\n");

        const fullPrompt = `You are an AI chat assistant.
        You are an AI chat assistant.
        Based on the previous chat history, provide a single, concise response to the user's message.

        Previous chat history:
        ${formattedHistory}

        User: ${currentMessage}`;

        // Generate response from Gemini AI using existing chat history
        const result = await model.generateContent(fullPrompt);

        return result.response.text().trim();
      } catch (error) {
        console.error("Worker error:", error);
        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 10,
    }
  );
};

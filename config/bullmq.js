import { Queue, QueueEvents } from "bullmq";
import { redis } from "./redis.js";

// Create chat processing queue
export const chatQueue = new Queue("chat-processing", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Initialize queue events for job completion tracking
export const queueEvents = new QueueEvents("chat-processing", {
  connection: redis,
});

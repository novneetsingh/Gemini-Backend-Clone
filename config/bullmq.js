import { Queue } from "bullmq";
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

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import { prisma } from "./config/prisma.js";
import subscribeRouter from "./routes/subscribe.route.js";
import chatRoomRouter from "./routes/chatroom.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import { chatWorker } from "./workers/chatWorker.js";
import { handleWebhook } from "./controllers/subscribe.controller.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());

// Use JSON for normal routes but DON'T parse the webhook body
app.use((req, res, next) => {
  // skip JSON body parsing for the webhook route so stripe raw body is preserved
  if (req.originalUrl === "/webhook/stripe") return next();
  express.json()(req, res, next);
});

// Test database connection
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

testDbConnection();

// Start chat worker
chatWorker();

// Routes
app.get("/", (req, res) => {
  res.send("Hello! This is the Gemini Backend Clone.");
});

// API routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/chatroom", chatRoomRouter);
app.use("/subscription", subscriptionRouter);
app.use("/subscribe", subscribeRouter);

// Webhook route - no authentication, raw body needed for Stripe signature verification
app.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gemini Backend Clone is listening at http://localhost:${port}`);
});

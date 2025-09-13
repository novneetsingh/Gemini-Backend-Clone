import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import { prisma } from "./config/prisma.js";
import chatRoomRouter from "./routes/chatroom.route.js";
import subscriptionRouter from "./routes/subscription.route.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
app.get("/", (req, res) => {
  res.send("Hello! This is the Gemini Backend Clone.");
});

// API routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/chatroom", chatRoomRouter);
app.use("/subscription", subscriptionRouter);

// Special route for Stripe webhook - needs raw body
// app.use("/subscription/webhook", express.raw({ type: "application/json" }));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gemini Backend Clone is listening at http://localhost:${port}`);
});

import { prisma } from "../config/prisma.js";

// Get current subscription for user
export const getCurrentSubscription = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { tier: true },
    });

    res.status(200).json({
      success: user ? true : false,
      message: user ? "Current subscription plan fetched" : "User not found",
      tier: user ? user.tier : null,
    });
  } catch (error) {
    console.error("Get current subscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

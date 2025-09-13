import { prisma } from "../config/prisma.js";

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await prisma.User.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: error });
  }
};

import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, mobileNumber, password } = req.body;

    // if (!name || !mobileNumber || !password) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please provide all required fields",
    //   });
    // }

    // Check if user already exists
    const existingUser = await prisma.User.findUnique({
      where: { mobileNumber },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with Basic tier by default
    const newUser = await prisma.User.create({
      data: {
        mobileNumber,
        name,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// send otp
export const sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // create a random 6 digit otp
    const otp = Math.floor(100000 + Math.random() * 900000);

    // set the otp in redis for 5 minutes
    await redis.setex(`otp:${mobileNumber}`, 60 * 5, otp.toString());
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        otp: otp.toString(),
      },
    });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    // get the otp from redis
    const storedOtp = await redis.get(`otp:${mobileNumber}`);

    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // delete the otp from redis
    await redis.del(`otp:${mobileNumber}`);

    // find the user
    const user = await prisma.User.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // create a jwt token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // find the user
    const user = await prisma.User.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // create a random 6 digit otp
    const otp = Math.floor(100000 + Math.random() * 900000);

    // set the otp in redis for 5 minutes
    await redis.setex(`otp:${mobileNumber}`, 60 * 5, otp.toString());

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        otp: otp.toString(),
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

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

    // compare the password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "wrong current password",
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // update the user's password in db
    await prisma.User.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

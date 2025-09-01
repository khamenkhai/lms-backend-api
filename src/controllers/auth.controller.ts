import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../utils/prismaClient";
import { AppError } from "../utils/app-error";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import sendMail from "../utils/sendMail";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

export const sendRegistrationOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required!", 400);
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new AppError("User already exists!", 409);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB with expiry 5 minutes
    await prismaClient.userOTP.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send OTP email
    await sendMail({
      email,
      subject: "Your OTP Code",
      template: "otp.ejs",
      data: { name, otp },
    });

    res.status(200).json({
      status: true,
      message: "OTP sent to your email. It expires in 5 minutes.",
    });
  }
);

export const verifyOTPAndRegister = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      throw new AppError("All fields including OTP are required!", 400);
    }
    const otpRecord = await prismaClient.userOTP.findFirst({
      where: {
        email,
        otp: String(otp),
      },
    });

    if (!otpRecord) {
      throw new AppError("Invalid OTP!", 400);
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new AppError("OTP expired. Please request a new one.", 400);
    }

    // Hash password and create user
    const hashedPassword = require("bcrypt").hashSync(password, 10);

    const user = await prismaClient.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Remove OTP record after successful registration
    await prismaClient.userOTP.delete({ where: { id: otpRecord.id } });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      status: true,
      message: "User registered successfully!",
      data: userWithoutPassword,
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await prismaClient.user.findFirst({ where: { email } });
    if (!user) {
      throw new AppError("Invalid email or password", 401); // More generic message for security
    }

    if (!compareSync(password, user.password)) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        ...userWithoutPassword,
        access_token: token,
      },
    });
  }
);

export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: true,
      message: "User profile retrieved successfully",
      data: userWithoutPassword,
    });
  }
);

import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../utils/prismaClient";
import { AppError } from "../utils/app-error";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

export const register = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required!", 400);
  }

  const existingUser = await prismaClient.user.findFirst({ where: { email } });
  if (existingUser) {
    throw new AppError("User already exists!", 409); // Changed from 500 to 409 Conflict
  }

  const hashedPassword = hashSync(password, 10);

  const user = await prismaClient.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(201).json({
    status: true,
    statusCode: 201,
    message: "User registered successfully",
    data: userWithoutPassword,
  });
});

export const login = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const user = await prismaClient.user.findFirst({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401); // More generic message for security
  }

  if (!compareSync(password, user.password)) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

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
});

export const getProfile = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
});
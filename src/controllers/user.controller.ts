import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";

// to get users from admin panel
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = req.query.role as string | undefined;
    const validRole = ["admin", "student", "instructor"];

    if (role && !validRole.includes(role)) {
      return next(new AppError("Invalid role filter!", 400));
    }

    // Fetch users
    const users = await prismaClient.user.findMany({
      where: role ? { role: role as "student" | "instructor" | "admin" } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    sendResponse(res, 200, "Users fetched successfully", users);
  } catch (error: any) {
    next(error);
  }
};

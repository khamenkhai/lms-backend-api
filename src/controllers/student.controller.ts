import { NextFunction, Response, Request } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";

export const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1; // default page 1
    const limit = parseInt(req.query.limit as string) || 10; // default 10 per page
    const skip = (page - 1) * limit;

    // Search query
    const search = (req.query.search as string) || "";

    const [total, students] = await prismaClient.$transaction([
      prismaClient.user.count({
        where: {
          role: "student",
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      }),
      prismaClient.user.findMany({
        where: {
          role: "student",
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
    ]);

    sendResponse(res, 200, "Fetch Data Success", {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      students,
    });
  } catch (error: any) {
    next(error);
  }
};

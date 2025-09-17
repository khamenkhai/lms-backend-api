import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { AppError } from "../utils/app-error";
import { UserRole } from "../../generated/prisma";

export const enrollInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // Check if user exists
    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if course exists
    const course = await prismaClient.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Prevent duplicate enrollment
    const existingEnrollment = await prismaClient.enrollment.findFirst({
      where: { user_id: userId, course_id: courseId },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: "You are already enrolled in this course!",
      });
    }

    // Set access expiration to 1 year from now
    const accessExpiresAt = new Date();
    accessExpiresAt.setFullYear(accessExpiresAt.getFullYear() + 1);

    // Create enrollment
    const enrollment = await prismaClient.enrollment.create({
      data: {
        user_id: userId,
        course_id: courseId,
        access_expires_at: accessExpiresAt,
      },
    });

    sendResponse(
      res,
      201,
      "You are now enrolled! Your access will expire in 1 year.",
      enrollment
    );
  } catch (error) {
    console.error("[enrollInCourse] Error:", error);
    next(error);
  }
};

export const getAllEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError("User not found", 401));
    }

    const queryCondition =
      user.role === UserRole.admin ? {} : { user_id: user.id };

    // Fetch enrollments with course modules and content progress
    const enrollments = await prismaClient.enrollment.findMany({
      where: queryCondition,
      include: {
        user: true,
        course: {
          include: {
            modules: {
              include: {
                contents: {
                  include: {
                    userContentProgresses: {
                      where: { user_id: user.id },
                      select: { is_completed: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const enriched = enrollments.map((enrollment) => {
      const modules = enrollment.course.modules;

      let totalContents = 0;
      let completedContents = 0;

      const modulesWithProgress = modules.map((module) => {
        const moduleTotal = module.contents.length;
        const moduleCompleted = module.contents.filter(
          (c) => c.userContentProgresses.length > 0 && c.userContentProgresses[0].is_completed
        ).length;

        totalContents += moduleTotal;
        completedContents += moduleCompleted;

        return {
          ...module,
          progressPercentage: moduleTotal === 0 ? 0 : (moduleCompleted / moduleTotal) * 100,
        };
      });

      const courseProgressPercentage =
        totalContents === 0 ? 0 : (completedContents / totalContents) * 100;

      return {
        ...enrollment,
        course: {
          ...enrollment.course,
          modules: modulesWithProgress,
        },
        progress: {
          totalContents,
          completedContents,
          progressPercentage: courseProgressPercentage,
          isCompleted: courseProgressPercentage === 100,
        },
      };
    });

    const message =
      user.role === UserRole.admin
        ? "Fetched all enrollments"
        : "Fetched your enrollments";

    sendResponse(res, 200, message, enriched);
  } catch (error) {
    console.error("[getAllEnrollments] Error:", error);
    next(error);
  }
};


export const getAllEnrollments2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError("User not found", 401));
    }

    const queryCondition =
      user.role === UserRole.admin ? {} : { user_id: user.id };

    const enrollments = await prismaClient.enrollment.findMany({
      where: queryCondition,
      include: {
        user: true,
        course: true,
      },
    });

    const message =
      user.role === UserRole.admin
        ? "Fetched all enrollments"
        : "Fetched your enrollments";

    sendResponse(res, 200, message, enrollments);
  } catch (error: any) {
    next(error);
  }
};

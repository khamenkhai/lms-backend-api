import { NextFunction, Request, Response } from "express";
import { sendJsonResponse, sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";
import { AppError } from "../utils/app-error";

export const getMyModuleProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const userId = user?.id;

    if (!userId) {
      throw new AppError("Unauthorized: User not found in request.", 401);
    }

    const { module_id } = req.body;
    if (!module_id) {
      throw new AppError("module_id is required", 400);
    }

    const moduleContents = await prismaClient.content.findMany({
      where: {
        module_id: module_id,
      },
      include: {
        userContentProgresses: {
          where: {
            user_id: userId,
          },
        },
      },
    });

    const totalContents = moduleContents.length;

    const completedCount = moduleContents.filter(
      (content) =>
        content.userContentProgresses.length > 0 &&
        content.userContentProgresses[0].is_completed
    ).length;

    const progressPercentage =
      totalContents === 0 ? 0 : (completedCount / totalContents) * 100;

    const responseData = {
      totalContents,
      completedCount,
      progressPercentage,
    };

    sendResponse(
      res,
      200,
      "Module content progress fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("[getMyModuleProgress] Error:", error);
    next(error);
  }
};

export const completeContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User id not found!", 400);
    }
    const { content_id } = req.body;

    await prismaClient.userContentProgress.upsert({
      where: {
        user_id_content_id: {
          user_id: userId,
          content_id: content_id,
        },
      },
      create: {
        user_id: userId,
        content_id: content_id,
        is_completed: true,
      },
      update: {
        is_completed: true,
      },
    });

    res.status(200).json({ message: "Content marked as completed" });
  } catch (error: any) {
    next(error);
  }
};



export const getCourseProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized: User not found in request.", 401);
    }

    const { course_id } = req.body;
    if (course_id === undefined || course_id === null) {
      throw new AppError("course_id is required", 400);
    }
    if (typeof course_id !== "number" || !Number.isInteger(course_id)) {
      throw new AppError("course_id must be an integer", 400);
    }

    // Check enrollment
    const enrollment = await prismaClient.enrollment.findFirst({
      where: { user_id: userId, course_id },
    });

    if (!enrollment) {
      throw new AppError("No enrollment found for this course.", 400);
    }

    // Fetch modules and their contents with user content progress
    const courseModules = await prismaClient.module.findMany({
      where: { course_id },
      include: {
        contents: {
          include: {
            userContentProgresses: {
              where: { user_id: userId },
              select: { is_completed: true },
            },
          },
        },
      },
    });

    let totalContents = 0;
    let completedContents = 0;

    courseModules.forEach((module) => {
      totalContents += module.contents.length;
      completedContents += module.contents.filter(
        (c) => c.userContentProgresses.length > 0 && c.userContentProgresses[0].is_completed
      ).length;
    });

    const progressPercentage =
      totalContents === 0 ? 0 : (completedContents / totalContents) * 100;

    // Mark course completed if 100%
    if (progressPercentage === 100 && !enrollment.completed_at) {
      await prismaClient.enrollment.update({
        where: { id: enrollment.id },
        data: { completed_at: new Date() },
      });
    }

    // --- Certificate generation ---
    if (progressPercentage === 100) {
      const existingCertificate = await prismaClient.certificate.findUnique({
        where: {
          user_id_course_id: { user_id: userId, course_id },
        },
      });

      if (!existingCertificate) {
        await prismaClient.certificate.create({
          data: {
            user_id: userId,
            course_id,
            certificate_url: `/certificate/${userId}-${course_id}`, // your route
          },
        });
      }
    }

    sendResponse(res, 200, "Course progress fetched successfully", {
      totalContents,
      completedContents,
      progressPercentage,
      certificateGenerated: progressPercentage === 100,
    });
  } catch (error) {
    console.error("[getCourseProgress] Error:", error);
    next(error);
  }
};


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

export const completeModule = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User id not found!", 400);
    }
    const { module_id } = req.body;

    await prismaClient.userModuleProgress.upsert({
      where: {
        user_id_module_id: {
          user_id: userId,
          module_id: module_id,
        },
      },
      create: {
        user_id: userId,
        module_id: module_id,
        isCompleted: true,
      },
      update: {
        isCompleted: true,
      },
    });

    res.status(200).json({ message: "Module marked as completed" });
  } catch (error: any) {
    next(error);
  }
};

export const completeCourseByStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { course_id } = req.body;
    const userId = req.user?.id;

    if (!course_id) {
      return next(new AppError("Course id is required", 400));
    }

    const modules = await prismaClient.module.findMany({
      where: {
        course_id: course_id,
      },
    });

    const userEnrolledData = await prismaClient.enrollment.findFirst({
      where: {
        user_id: userId,
        course_id: course_id,
      },
    });

    if (!userEnrolledData) {
      return next(new AppError("You haven't enrolled this course!", 400));
    }

    const totalModule = modules.length;
    const moduleIds = modules.map((c) => c.id);

    if (totalModule === 0) {
      return res.status(400).json({ message: "This course has no module." });
    }

    // Step 2: Count how many contents the user completed
    const completedCount = await prismaClient.userModuleProgress.count({
      where: {
        user_id: userId,
        module_id: { in: moduleIds },
        isCompleted: true,
      },
    });

    // Step 3: If not all completed, reject
    if (completedCount < totalModule) {
      return res.status(400).json({
        message: "User has not completed all modules in the course.",
        completed: completedCount,
        total: totalModule,
      });
    }

    // Step 4: Update enrollment record
    const updatedEnrollment = await prismaClient.enrollment.updateMany({
      where: {
        user_id: userId,
        course_id: course_id,
      },
      data: {
        progress_percentage: 100.0,
        completed_at: new Date(),
      },
    });

    const certificate = await prismaClient.certificate.create({
      data: {
        user_id: Number(userId),
        course_id: course_id,
        certificate_url: "dfdf",
      },
    });

    sendJsonResponse({
      res,
      statusCode: 200,
      message: "Course completed successfully",
      data: updatedEnrollment,
    });
  } catch (error: any) {
    console.error("[completeCourseByStudent] Error:", error);
    next(error);
  }
};

export const getCourseProgress = async (
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

    const { course_id } = req.body;
    if (!course_id) {
      throw new AppError("course_id is required", 400);
    }

    const isExist = await prismaClient.enrollment.findFirst({
      where: {
        user_id: userId,
        course_id: course_id,
      },
    });

    console.log(` enrollment : ${isExist}`);

    if (!isExist) {
      throw new AppError("Not enrollment found!", 400);
    }

    const courseModules = await prismaClient.module.findMany({
      where: {
        course_id: course_id,
      },
      include: {
        user_module_progresses: {
          where: {
            user_id: userId,
            id: {},
          },
        },
      },
    });

    const totalModules = courseModules.length;

    const completedCount = courseModules.filter(
      (module) =>
        module.user_module_progresses.length > 0 &&
        module.user_module_progresses[0].isCompleted
    ).length;

    const progressPercentage =
      totalModules === 0 ? 0 : (completedCount / totalModules) * 100;

    // Filter only NOT COMPLETED modules
    const incompleteModules = courseModules.filter(
      (module) =>
        module.user_module_progresses.length === 0 ||
        !module.user_module_progresses[0].isCompleted
    );

    const responseData = {
      totalModules,
      completedCount,
      progressPercentage,
    };

    sendResponse(
      res,
      200,
      "Course progress fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("[getMyModuleProgress] Error:", error);
    next(error);
  }
};

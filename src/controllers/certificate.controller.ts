// controllers/certificateController.ts
import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../utils/prismaClient";
import { AppError } from "../utils/app-error";
import { sendResponse } from "../utils/response";
import { addJob } from "../utils/generate-certificate";

export const generateCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { enrollment_id } = req.body;

    if (!userId) return next(new AppError("User not found!", 401));

    // Fetch minimal info to calculate progress
    const totalContents = await prismaClient.content.count({
      where: { module: { course_id: enrollment_id } },
    });

    const completedContents = await prismaClient.userContentProgress.count({
      where: { user_id: userId, content: { module: { course_id: enrollment_id } }, is_completed: true },
    });

    const progress = totalContents === 0 ? 0 : (completedContents / totalContents) * 100;

    if (progress < 80)
      return next(
        new AppError(
          "You must complete at least 80% of the course to generate a certificate",
          400
        )
      );

    // Check or create certificate placeholder
    let certificate = await prismaClient.certificate.findUnique({
      where: { user_id_course_id: { user_id: userId, course_id: enrollment_id } },
    });

    if (!certificate) {
      certificate = await prismaClient.certificate.create({
        data: { user_id: userId, course_id: enrollment_id, certificate_url: "" },
      });
    }

    // Push job to async queue
    const userName = req.user?.name || "Anonymous";
    const courseTitle = (await prismaClient.course.findUnique({
      where: { id: enrollment_id },
    }))?.title || "Untitled Course";

    addJob({
      userId,
      courseId: enrollment_id,
      userName,
      courseTitle,
    });

    // Respond immediately
    sendResponse(res, 202, "Certificate generation in progress.", {
      user_id: userId,
      course_id: enrollment_id,
      certificate_url: certificate.certificate_url, // empty for now
    });
  } catch (err) {
    next(err);
  }
};

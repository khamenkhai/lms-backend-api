// controllers/certificateController.ts
import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../utils/prismaClient";
import { AppError } from "../utils/app-error";
import { sendResponse } from "../utils/response";
import { addJob } from "../utils/generate-certificate";

export const checkCertificateEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { enrollment_id } = req.body;

    if (!userId) return next(new AppError("User not found!", 401));

    // Count total contents in the course
    const totalContents = await prismaClient.content.count({
      where: { module: { course_id: enrollment_id } },
    });

    if (totalContents === 0) {
      return sendResponse(res, 200, "No content in this course yet.", {
        eligible: false,
        progress: 0,
      });
    }

    // Count completed contents for this user
    const completedContents = await prismaClient.userContentProgress.count({
      where: {
        user_id: userId,
        content: { module: { course_id: enrollment_id } },
        is_completed: true,
      },
    });

    const progress = (completedContents / totalContents) * 100;
    const eligible = progress >= 80;

    sendResponse(res, 200, "Certificate eligibility checked.", {
      eligible,
      progress: Number(progress.toFixed(2)),
    });
  } catch (err) {
    next(err);
  }
};

export const generateCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { enrollment_id } = req.body;

    if (!userId) return next(new AppError("User not found!", 401));

    // Fetch the enrollment to get the course_id
    const enrollment = await prismaClient.enrollment.findUnique({
      where: { id: enrollment_id },
      select: { course_id: true },
    });

    if (!enrollment) return next(new AppError("Enrollment not found!", 404));

    const courseId = enrollment.course_id;

    // Fetch total contents for this course
    const totalContents = await prismaClient.content.count({
      where: { module: { course_id: courseId } },
    });

    const completedContents = await prismaClient.userContentProgress.count({
      where: {
        user_id: userId,
        content: { module: { course_id: courseId } },
        is_completed: true,
      },
    });

    const progress =
      totalContents === 0 ? 0 : (completedContents / totalContents) * 100;

      console.log("📚 Total Contents:", totalContents);
console.log("✅ Completed Contents:", completedContents);
console.log("📈 Progress:", progress.toFixed(2) + "%");

    if (progress < 80)
      return next(
        new AppError(
          "You must complete at least 80% of the course to generate a certificate",
          400
        )
      );

    // Check or create certificate placeholder
    let certificate = await prismaClient.certificate.findUnique({
      where: {
        user_id_course_id: { user_id: userId, course_id: enrollment_id },
      },
    });

    if (!certificate) {
      certificate = await prismaClient.certificate.create({
        data: {
          user_id: userId,
          course_id: enrollment_id,
          certificate_url: "",
        },
      });
    }

    // Push job to async queue
    const userName = req.user?.name || "Anonymous";
    const course = await prismaClient.course.findUnique({
      where: { id: enrollment_id },
      include: {
        instructor: true,
      },
    });

    if (!course) {
      next(new AppError("Course not found!"));
    }

    const instructorName = course?.instructor.name || "Unknow";
    const courseTitle = course?.title || "";

    addJob({
      userId,
      courseId: enrollment_id,
      userName,
      instructorName,
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

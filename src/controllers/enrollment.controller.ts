import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { EnrollmentSchema } from "../validators/schema";
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

// export const getEnrolledCoursesByUserId = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<any> => {
//   try {
//     const userId = parseInt(req.params.userId);

//     // Check if user exists
//     const user = await prismaClient.user.findUnique({
//       where: { id: userId },
//     });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Fetch all enrollments with course info
//     const enrollments = await prismaClient.enrollment.findMany({
//       where: { user_id: userId },
//       include: {
//         user: true,
//         course: {
//           include: {
//             category: true,
//             modules: {
//               include: {
//                 contents: true,
//               },
//             },
//             instructor: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     const enrolledCourses = enrollments.map((e) => e.course);

//     sendResponse(
//       res,
//       200,
//       "Enrolled courses fetched successfully",
//       enrolledCourses
//     );
//   } catch (error) {
//     console.error("[getEnrolledCoursesByUserId] Error:", error);
//     next(error);
//   }
// };

// export const getAllEnrollments = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Pagination
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     // Search and filters
//     const search = (req.query.search as string) || "";
//     const status = req.query.status as string; // "completed" or "in-progress"

//     const whereClause: any = {};

//     // Filter by completion status
//     if (status === "completed") {
//       whereClause.completed_at = { not: null };
//     } else if (status === "in-progress") {
//       whereClause.completed_at = null;
//     }

//     // Include relations for searching
//     const enrollments = await prismaClient.enrollment.findMany({
//       where: {
//         ...whereClause,
//         OR: [
//           { user: { name: { contains: search, mode: "insensitive" } } },
//           { course: { title: { contains: search, mode: "insensitive" } } },
//         ],
//       },
//       include: {
//         user: true,
//         course: true,
//       },
//       skip,
//       take: limit,
//       orderBy: { enrolled_at: "desc" },
//     });

//     // Total count for pagination
//     const total = await prismaClient.enrollment.count({
//       where: {
//         ...whereClause,
//         OR: [
//           { user: { name: { contains: search, mode: "insensitive" } } },
//           { course: { title: { contains: search, mode: "insensitive" } } },
//         ],
//       },
//     });

//     sendResponse(res, 200, "Enrollments fetched successfully!", {
//       enrollments,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

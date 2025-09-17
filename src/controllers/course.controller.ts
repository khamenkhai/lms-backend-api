import { NextFunction, Request, Response } from "express";
import { sendJsonResponse, sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";
import { AppError } from "../utils/app-error";
import { CourseSchema } from "../validators/course-schema";

const parseId = (idParam: string | undefined): number | null => {
  if (!idParam) return null;
  const id = Number(idParam);
  return isNaN(id) ? null : id;
};

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // This will throw if invalid
    const validatedData = CourseSchema.parse(req.body);

    const courseData = await prismaClient.course.create({
      data: validatedData,
    });

    sendResponse(res, 201, "Course created successfully!", courseData);
  } catch (error) {
    console.error("[createCourse] Error:", error);
    next(error);
  }
};

// Get all courses with pagination, filters, and search
export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // --- 1. Parse query params ---
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : undefined;
    const level = req.query.level as string | undefined;
    const search = req.query.search as string | undefined;

    const skip = (page - 1) * pageSize;

    // --- 2. Build Prisma "where" dynamically ---
    const where: any = {};
    if (categoryId) where.category_id = categoryId;
    if (level) where.level = level;
    if (search) where.title = { contains: search, mode: "insensitive" };

    // --- 3. Fetch courses with pagination ---
    const courses = await prismaClient.course.findMany({
      skip,
      take: pageSize,
      where,
    //   orderBy: {
    //     createdAt: "desc",
    //   },
      include: {
        category: true,
        instructor: {
          select: { id: true, name: true, email: true },
        },
        enrollments: true,
      },
    });

    // --- 4. Get total count for pagination meta ---
    const total = await prismaClient.course.count({ where });
    const totalPages = Math.ceil(total / pageSize);

    // --- 5. Send response ---
    sendResponse(res, 200, "Courses fetched successfully!", {
      courses: courses,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error("[getCourses] Error:", error);
    next(error);
  }
};

// Get course by ID
export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const courseId = parseId(req.params.id);
    if (courseId === null) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await prismaClient.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        modules: true,
        enrollments: true,
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    sendResponse(res, 200, "Course fetched successfully!", course);
  } catch (error) {
    console.error("[getCourseById] Error:", error);
    next(error);
  }
};

// Update course
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const courseId = parseId(req.params.id);
    if (courseId === null) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Parse only the fields that are sent
    const validation = CourseSchema.partial().safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid course data",
        errors: validation.error.errors,
      });
    }

    const dataToUpdate = validation.data;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    // Make sure course exists before updating
    const existingCourse = await prismaClient.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const updatedCourse = await prismaClient.course.update({
      where: { id: courseId },
      data: dataToUpdate, // only update the fields that are present
    });

    sendResponse(res, 200, "Course updated successfully!", updatedCourse);
  } catch (error) {
    console.error("[updateCourse] Error:", error);
    next(error);
  }
};

// Delete course
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const courseId = parseId(req.params.id);
    if (courseId === null) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const existingCourse = await prismaClient.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    await prismaClient.course.delete({
      where: { id: courseId },
    });

    sendResponse(res, 200, "Course deleted successfully!", null);
  } catch (error) {
    console.error("[deleteCourse] Error:", error);
    next(error);
  }
};



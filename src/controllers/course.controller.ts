import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";
import { CourseSchema } from "../validators/schema";
import { AppError } from "../utils/app-error";

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


// Get all courses
export const getCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const courses = await prismaClient.course.findMany({
            include: {
                category: true,
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                enrollments: true,

            },
        });
        sendResponse(res, 200, "Courses fetched successfully!", courses);
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
            return res.status(400).json({ message: "Invalid course data", errors: validation.error.errors });
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


export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = req?.user;
        const userId = user?.id;

        if (!user) {
            next(new AppError("User not found!", 404));
        }
        const courses = await prismaClient.course.findMany({
            where: {
                enrollments: {
                    some: {
                        user_id: userId
                    },
                },
            },
            include: {
                category: true,
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                modules: {
                    include: {
                        user_module_progresses: {
                            where: { user_id: userId },
                            select: {
                                progressPercentage: true,
                                isCompleted: true,
                                updatedAt: true,
                            },
                        },
                        contents: {
                            include: {
                                contentProgresses: {
                                    where: {
                                        user_id: userId
                                    }
                                },
                            }
                        },
                    },
                },
            },
        });
        sendResponse(res, 200, "Course fetched successfully!", courses);
    }

    catch (error: any) {
        console.error("[deleteCourse] Error:", error);
        next(error);
    }
}
import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { EnrollmentSchema } from "../validators/schema";

export const createEnrollment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        // Validate request body with safeParse for error handling
        const parseResult = EnrollmentSchema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parseResult.error.errors,
            });
        }

        const {
            name,
            completed_at,
            access_expires_at,
            progress_percentage,
            user_id,
            course_id,
        } = parseResult.data;

        // Check if user exists
        const user = await prismaClient.user.findUnique({
            where: { id: user_id },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if course exists
        const course = await prismaClient.course.findUnique({
            where: { id: course_id },
        });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Create enrollment
        const enrollment = await prismaClient.enrollment.create({
            data: {
                name,
                completed_at,
                access_expires_at,
                progress_percentage,
                user_id,
                course_id,
            },
        });

        sendResponse(res, 201, "Enrollment created successfully!", enrollment);

    } catch (error) {
        console.error("[confirmOrder] Error:", error);
        next(error);
    }
};


export const getEnrolledCoursesByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = parseInt(req.params.userId);

        // Check if user exists
        const user = await prismaClient.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch all enrollments with course info
        const enrollments = await prismaClient.enrollment.findMany({
            where: { user_id: userId },
            include: {
                course: {
                    include: {
                        category: true,
                        modules: {
                            include: {
                                contents: true,
                            },
                        },
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        const enrolledCourses = enrollments.map((e) => e.course);

        sendResponse(res, 200, "Enrolled courses fetched successfully", enrolledCourses);
    } catch (error) {
        console.error("[getEnrolledCoursesByUserId] Error:", error);
        next(error);
    }
};


export const getAllEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enrollments = await prismaClient.enrollment.findMany({});

        sendResponse(res, 200, "Enrollment fetch successfully!", enrollments)
    } catch (error: any) {
        next(error);
    }
}
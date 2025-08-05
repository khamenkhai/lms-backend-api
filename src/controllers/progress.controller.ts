import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";
import { ContentSchema } from "../validators/schema";
import { AppError } from "../utils/app-error";


export const getMyModuleProgress = async (req: Request, res: Response, next: NextFunction) => {
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
                contentProgresses: {
                    where: {
                        user_id: userId,
                    },
                },
            },
        });

        const totalContents = moduleContents.length;

        const completedCount = moduleContents.filter(content =>
            content.contentProgresses.length > 0 && content.contentProgresses[0].is_completed
        ).length;

        const progressPercentage = totalContents === 0 ? 0 : (completedCount / totalContents) * 100;

        const responseData = {
            totalContents,
            completedCount,
            progressPercentage,
            moduleContents, // optional: you can include this or just summary
        };

        sendResponse(res, 200, "Module content progress fetched successfully", responseData);
    } catch (error) {
        console.error("[getMyModuleProgress] Error:", error);
        next(error);
    }
};

export const getCourseProgress = async (req: Request, res: Response, next: NextFunction) => {
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
                course_id: course_id
            },
            include: {
                user_module_progresses: {
                    where: {
                        user_id: userId,
                    },
                },
            },
        });

        const totalModules = courseModules.length;

        const completedCount = courseModules.filter(module =>
            module.user_module_progresses.length > 0 && module.user_module_progresses[0].isCompleted
        ).length;

        const progressPercentage = totalModules === 0 ? 0 : (completedCount / totalModules) * 100;

        const responseData = {
            totalModules,
            completedCount,
            progressPercentage,
            courseModules, // optional: you can include this or just summary
        };

        sendResponse(res, 200, "Course progress fetched successfully", responseData);
    } catch (error) {
        console.error("[getMyModuleProgress] Error:", error);
        next(error);
    }
};

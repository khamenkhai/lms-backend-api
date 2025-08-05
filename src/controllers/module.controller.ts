import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";
import { ModuleSchema } from "../validators/schema";
import { AppError } from "../utils/app-error";

const parseId = (idParam: string | undefined): number | null => {
    if (!idParam) return null;
    const id = Number(idParam);
    return isNaN(id) ? null : id;
};

export const createModule = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        // This will throw if invalid
        const validatedData = ModuleSchema.parse(req.body);

        const moduleData = await prismaClient.module.create({
            data: validatedData,
        });

        sendResponse(res, 201, "Module created successfully!", moduleData);
    } catch (error) {
        console.error("[createModule] Error:", error);
        next(error);
    }
};


// Get all modules
export const getModulesByCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const courseId = Number(req.params?.courseId);

        const courses = await prismaClient.module.findMany({
            where: {
                course_id: courseId
            },
            include: {
                contents: true
            }
        });

        sendResponse(res, 200, "Course Modules fetched successfully!", courses);
    } catch (error) {
        console.error("[getModulesByCourse] Error:", error);
        next(error);
    }
};

// Get module by ID
export const getModulesById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const moduleId = parseId(req.params.id);
        if (moduleId === null) {
            return res.status(400).json({ message: "Invalid module ID" });
        }

        const module = await prismaClient.module.findUnique({
            where: { id: moduleId },
            include: {
                contents: {
                    include: {
                        quiz: true
                    }
                }
            }

        });

        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        sendResponse(res, 200, "Module fetched successfully!", module);
    } catch (error) {
        module
        console.error("[getModulesById] Error:", error);
        next(error);
    }
};

// Update module
export const updateModules = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const moduleId = parseId(req.params.id);
        if (moduleId === null) {
            return res.status(400).json({ message: "Invalid module ID" });
        }

        // Parse only the fields that are sent
        const validation = ModuleSchema.partial().safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ message: "Invalid module data", errors: validation.error.errors });
        }

        const dataToUpdate = validation.data;

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: "No fields provided for update" });
        }


        const existingModule = await prismaClient.module.findUnique({
            where: { id: moduleId },
        });

        if (!existingModule) {
            return res.status(404).json({ message: "Module not found" });
        }

        const updateModule = await prismaClient.module.update({
            where: { id: moduleId },
            data: dataToUpdate,
        });

        sendResponse(res, 200, "Module updated successfully!", updateModule);
    } catch (error) {
        console.error("[updateModules] Error:", error);
        next(error);
    }
};

// Delete module
export const deleteModules = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {

        const moduleId = parseId(req.params.id);

        if (moduleId === null) {
            return res.status(400).json({ message: "Invalid module ID" });
        }

        const existingModule = await prismaClient.module.findUnique({
            where: { id: moduleId },
        });

        if (!existingModule) {
            return res.status(404).json({ message: "Module not found" });
        }

        await prismaClient.module.delete({
            where: { id: moduleId },
        });

        sendResponse(res, 200, "Module deleted successfully!", null);

    } catch (error) {
        console.error("[deleteModules] Error:", error);
        next(error);
    }
};



export const completeModuleByStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const userId = user?.id;

        if (!userId) {
            throw new AppError("Unauthorized: User not found in request.", 401);
        }

        const { moduleId } = req.body;
        if (!moduleId || typeof moduleId !== 'number') {
            throw new AppError("Invalid or missing 'moduleId' in request body.", 400);
        }

        const course = await prismaClient.course.findFirst({
            where: {
                modules: {
                    some: {
                        id: moduleId,
                    },
                },
            },
        });

        if (!course) {
            throw new AppError("Course not found for the given module.", 404);
        }


        const enrollment = await prismaClient.enrollment.findFirst({
            where: {
                user_id: userId,
                course_id: course?.id
            }
        });

        if (!enrollment) {
            throw new AppError("You are not enrolled in the course for this module.", 401);
        }


        const existingModuleProgress = await prismaClient.userModuleProgress.findUnique({
            where: {
                user_id_module_id: {
                    user_id: userId,
                    module_id: moduleId,
                },
            },
        });

        if (existingModuleProgress) {
            throw new AppError("Content progress already recorded.", 409); // Conflict
        }

        const contentData = await prismaClient.userModuleProgress.create({
            data: {
                user_id: userId,
                module_id: moduleId,
                isCompleted: true,
                progressPercentage: 100,
            },
        });

        sendResponse(res, 201, "Module progress created successfully!", contentData);
    } catch (error) {
        console.error("[completeContentByStudent] Error:", error);
        next(error);
    }
};
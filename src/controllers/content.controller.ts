import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";
import { ContentSchema } from "../validators/schema";
import { AppError } from "../utils/app-error";

const parseId = (idParam: string | undefined): number | null => {
  if (!idParam) return null;
  const id = Number(idParam);
  return isNaN(id) ? null : id;
};

export const createContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const data = ContentSchema.parse(req.body);

    const contentData = await prismaClient.content.create({
      data: data,
    });

    sendResponse(res, 201, "Content created successfully!", contentData);
  } catch (error) {
    console.error("[createContent] Error:", error);
    next(error);
  }
};

// Get all contents
export const getContentsByModule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const moduleId = Number(req.params?.moduleId);

    const courses = await prismaClient.content.findMany({
      where: {
        module_id: moduleId,
      },
      include: {
        quiz: true,
      },
    });

    sendResponse(res, 200, "Module's content fetched successfully!", courses);
  } catch (error) {
    console.error("[getContentsByModule] Error:", error);
    next(error);
  }
};
// Get all contents
export const getContentsByStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const moduleId = Number(req.params?.moduleId);

    const courses = await prismaClient.content.findMany({
      where: {
        module_id: moduleId,
      },
      include: {
        quiz: true,
        userContentProgresses: true,
      },
    });

    const data = courses.map((course) => {
      const isCompleted = course.userContentProgresses[0]?.is_completed;
      return {
        ...course,
        isCompleted,
      };
    });

    sendResponse(res, 200, "Module's content fetched successfully!", data);
  } catch (error) {
    console.error("[getContentsByModule] Error:", error);
    next(error);
  }
};

// Get content by ID
export const getContentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const contentId = parseId(req.params.id);
    if (contentId === null) {
      return res.status(400).json({ message: "Invalid module ID" });
    }

    const content = await prismaClient.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    sendResponse(res, 200, "Content fetched successfully!", content);
  } catch (error) {
    console.error("[getContentById] Error:", error);
    next(error);
  }
};

// Update content by ID
export const updateContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const contentId = parseId(req.params.id);

    if (contentId === null) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    const existingContent = await prismaClient.content.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      return res.status(404).json({ message: "Content not found" });
    }

    const result = ContentSchema.partial().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }

    const updatedContent = await prismaClient.content.update({
      where: { id: contentId },
      data: result.data, // This is the parsed & validated data
    });

    sendResponse(res, 200, "Content updated successfully!", updatedContent);
  } catch (error) {
    console.error("[updateContent] Error:", error);
    next(error);
  }
};

// Delete content
export const deleteContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const contentId = parseId(req.params.id);

    if (contentId === null) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    const existingContent = await prismaClient.content.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      return res.status(404).json({ message: "Content not found" });
    }

    await prismaClient.content.delete({
      where: { id: contentId },
    });

    sendResponse(res, 200, "Content deleted successfully!", null);
  } catch (error) {
    console.error("[deleteContent] Error:", error);
    next(error);
  }
};

export const completeContentByStudent = async (
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

    const { content_id } = req.body;
    if (!content_id || typeof content_id !== "number") {
      throw new AppError(
        "Invalid or missing 'content_id' in request body.",
        400
      );
    }

    // 1️⃣ Check if content progress already exists
    const existingProgress = await prismaClient.userContentProgress.findUnique({
      where: { user_id_content_id: { user_id: userId, content_id } },
    });

    if (existingProgress) {
      throw new AppError("Content progress already recorded.", 409);
    }

    // 2️⃣ Create content progress as completed
    const contentProgress = await prismaClient.userContentProgress.create({
      data: {
        user_id: userId,
        content_id,
        is_completed: true,
      },
    });

    // 3️⃣ Fetch module id of this content
    const content = await prismaClient.content.findUnique({
      where: { id: content_id },
      select: { module_id: true },
    });

    if (content) {
      const moduleId = content.module_id;

      // 4️⃣ Check if any contents in this module are still incomplete
      const incompleteCount = await prismaClient.userContentProgress.count({
        where: {
          user_id: userId,
          content: { module_id: moduleId },
          is_completed: false,
        },
      });

      // 5️⃣ If all contents are completed, mark module completed
      if (incompleteCount === 0) {
        await prismaClient.userModuleProgress.upsert({
          where: {
            user_id_module_id: { user_id: userId, module_id: moduleId },
          },
          update: { isCompleted: true },
          create: { user_id: userId, module_id: moduleId, isCompleted: true },
        });
      }
    }

    sendResponse(
      res,
      201,
      "Content progress created successfully!",
      contentProgress
    );
  } catch (error) {
    console.error("[completeContentByStudent] Error:", error);
    next(error);
  }
};

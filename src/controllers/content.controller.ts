import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";
import { ContentSchema } from "../validators/schema";
import { AppError } from "../utils/app-error";
import cloudinary from "../utils/cloudinary";

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
    console.log("📝 [createContent] Parsing FormData...");

    // Manual validation
    const { title, content_type, duration, position, module_id } = req.body;

    const errors: string[] = [];

    if (!title || typeof title !== "string" || title.trim() === "") {
      errors.push("Title is required and must be a string");
    }

    const validTypes = ["VIDEO", "ARTICLE", "QUIZ"];
    if (!content_type || !validTypes.includes(content_type)) {
      errors.push(`Content type must be one of: ${validTypes.join(", ")}`);
    }

    if (duration && !/^\d{1,2}:\d{2}$/.test(duration)) {
      errors.push("Duration must be in mm:ss or hh:mm format");
    }

    const positionNum = Number(position);
    if (!position || isNaN(positionNum) || positionNum < 1) {
      errors.push("Position is required and must be an integer >= 1");
    }

    const moduleIdNum = Number(module_id);
    if (!module_id || isNaN(moduleIdNum) || moduleIdNum < 1) {
      errors.push("Module ID is required and must be an integer >= 1");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    console.log("✅ [createContent] Validation passed");

    // Handle file upload
    let fileUrl = "";
    if (req.file) {
      console.log(
        "📁 [createContent] File detected, uploading to Cloudinary..."
      );
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "contents",
      });
      fileUrl = uploadResult.secure_url;
      console.log("☁️ [createContent] File uploaded:", fileUrl);
    } else {
      console.log("📂 [createContent] No file attached.");
    }

    // Save to DB
    const contentData = await prismaClient.content.create({
      data: {
        title,
        content_type,
        duration: duration || null,
        position: positionNum,
        module_id: moduleIdNum,
        content_url: fileUrl,
      },
    });

    sendResponse(res, 201, "Content created successfully!", contentData);
    console.log("🎉 [createContent] Response sent!");
  } catch (error) {
    console.error("❌ [createContent] Error:", error);
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

    // Validate body (partial for update)
    const result = ContentSchema.partial().safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }

    let fileUrl = existingContent.content_url;

    // Handle file upload if present
    if (req.file) {
      console.log(
        "📁 [updateContent] New file detected, uploading to Cloudinary..."
      );
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "contents",
      });
      fileUrl = uploadResult.secure_url;
      console.log("☁️ [updateContent] File uploaded:", fileUrl);
    } else {
      console.log(
        "📂 [updateContent] No new file uploaded, keeping existing file."
      );
    }

    // Merge updates
    const updatedContent = await prismaClient.content.update({
      where: { id: contentId },
      data: {
        ...result.data,
        content_url: fileUrl, // updated only if new file uploaded
      },
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

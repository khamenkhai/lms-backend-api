import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response";
import { prismaClient } from "../utils/prismaClient";

const parseId = (idParam: string | undefined): number | null => {
  if (!idParam) return null;
  const id = Number(idParam);
  return isNaN(id) ? null : id;
};

export const createTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Invalid template name" });
    }

    const template = await prismaClient.template.create({
      data: { name: name.trim() },
    });

    sendResponse(res, 201, "Template created successfully!", template);
  } catch (error) {
    console.error("[createTemplate] Error:", error);
    next(error);
  }
};

export const getTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const templates = await prismaClient.template.findMany();
    sendResponse(res, 200, "Templates fetched successfully!", templates);
  } catch (error) {
    console.error("[getTemplates] Error:", error);
    next(error);
  }
};

export const getTemplateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const templateId = parseId(req.params.id);
    if (templateId === null) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const template = await prismaClient.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    sendResponse(res, 200, "Template fetched successfully!", template);
  } catch (error) {
    console.error("[getTemplateById] Error:", error);
    next(error);
  }
};

export const updateTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const templateId = parseId(req.params.id);
    if (templateId === null) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Invalid template name" });
    }

    // Make sure template exists before updating
    const existingTemplate = await prismaClient.template.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    const updatedTemplate = await prismaClient.template.update({
      where: { id: templateId },
      data: { name: name.trim() },
    });

    sendResponse(res, 200, "Template updated successfully!", updatedTemplate);
  } catch (error) {
    console.error("[updateTemplate] Error:", error);
    next(error);
  }
};

export const deleteTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const templateId = parseId(req.params.id);
    if (templateId === null) {
      return res.status(400).json({ message: "Invalid template ID" });
    }

    // Check if template exists before deleting
    const existingTemplate = await prismaClient.template.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    await prismaClient.template.delete({
      where: { id: templateId },
    });

    sendResponse(res, 200, "Template deleted successfully!", null);
  } catch (error) {
    console.error("[deleteTemplate] Error:", error);
    next(error);
  }
};

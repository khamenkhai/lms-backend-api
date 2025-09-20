import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";

// Create a new tag
export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tag name is required" });

    const tag = await prismaClient.tag.create({
      data: { name },
    });

    return res
      .status(201)
      .json({ data: tag, message: "Tag created successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all tags
export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const tags = await prismaClient.tag.findMany({
      orderBy: { id: "asc" },
    });

    return res
      .status(200)
      .json({ data: tags, message: "Tags fetched successfully" });
  } catch (err) {
    next(err);
  }
};

// Get single tag by ID
export const getTagById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const tag = await prismaClient.tag.findUnique({
      where: { id: Number(id) },
    });
    if (!tag) return res.status(404).json({ message: "Tag not found" });

    return res
      .status(200)
      .json({ data: tag, message: "Tag fetched successfully" });
  } catch (err) {
    next(err);
  }
};

// Update a tag
export const updateTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tag name is required" });

    const updatedTag = await prismaClient.tag.update({
      where: { id: Number(id) },
      data: { name },
    });

    return res
      .status(200)
      .json({ data: updatedTag, message: "Tag updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Delete a tag
export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    await prismaClient.tag.delete({ where: { id: Number(id) } });

    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (err) {
    next(err);
  }
};

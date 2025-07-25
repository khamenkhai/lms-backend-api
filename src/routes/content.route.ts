import { Router } from "express";
import { createContent, deleteContent, getContentById, getContentsByModule, updateContent } from "../controllers/content.controller";

const contentRoutes = Router();

contentRoutes.post("/contents", createContent);
contentRoutes.get("/module-contents/:moduleId", getContentsByModule);
contentRoutes.get("/contents/:id", getContentById);
contentRoutes.put("/contents/:id", updateContent);
contentRoutes.delete("/contents:id", deleteContent);

export default contentRoutes;

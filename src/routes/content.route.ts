import { Router } from "express";
import { completeContentByStudent, createContent, deleteContent, getContentById, getContentsByModule, getContentsByStudents, updateContent } from "../controllers/content.controller";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";

const contentRoutes = Router();

contentRoutes.post("/contents", authMiddleware, authorizeRoles("admin"), createContent);
contentRoutes.get("/module-contents/:moduleId", getContentsByModule);
contentRoutes.get("/student/module-contents/:moduleId", getContentsByStudents);
contentRoutes.get("/contents/:id", getContentById);
contentRoutes.put("/contents/:id", updateContent);
contentRoutes.delete("/contents/:id", deleteContent);

// students routes
contentRoutes.post("/complete-contents", authMiddleware, completeContentByStudent);

export default contentRoutes;

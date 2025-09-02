import { Router } from "express";
import { completeContent, completeCourseByStudent, getCourseProgress, getMyModuleProgress } from "../controllers/progress.controller";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";

const progressRoutes = Router();

progressRoutes.get("/module-progresss", authMiddleware, getMyModuleProgress);
progressRoutes.post("/complete-content", authMiddleware, completeContent);
progressRoutes.get("/course-progresss", authMiddleware, getCourseProgress);
progressRoutes.post("/complete-course", authMiddleware, authorizeRoles("student"), completeCourseByStudent)

export default progressRoutes;

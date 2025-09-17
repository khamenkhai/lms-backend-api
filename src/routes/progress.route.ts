import { Router } from "express";
import {
  completeContent,
  getCourseProgress,
  getMyModuleProgress,
} from "../controllers/progress.controller";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";

const progressRoutes = Router();

progressRoutes.get(
  "/student/module-progresss",
  authMiddleware,
  getMyModuleProgress
);
progressRoutes.post(
  "/student/complete-content",
  authMiddleware,
  completeContent
);
progressRoutes.get(
  "/student/course-progresss",
  authMiddleware,
  getCourseProgress
);

export default progressRoutes;

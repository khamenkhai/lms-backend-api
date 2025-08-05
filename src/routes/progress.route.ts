import { Router } from "express";
import { getCourseProgress, getMyModuleProgress } from "../controllers/progress.controller";
import authMiddleware from "../middlewares/authMiddleware";

const progressRoutes = Router();

progressRoutes.get("/module-progresss", authMiddleware, getMyModuleProgress);
progressRoutes.get("/course-progresss", authMiddleware, getCourseProgress);

export default progressRoutes;

import { Router } from "express";
import { completeModuleByStudent, createModule, deleteModules, getModulesByCourse, getModulesById, updateModules } from "../controllers/module.controller";
import authMiddleware from "../middlewares/authMiddleware";

const moduleRoutes = Router();

moduleRoutes.post("/modules", createModule);
moduleRoutes.get("/course-module/:courseId", getModulesByCourse);
moduleRoutes.get("/modules/:id", getModulesById);
moduleRoutes.put("/modules/:id", updateModules);
moduleRoutes.delete("/modules/:id", deleteModules);

// complete module
moduleRoutes.post("/complete-module", authMiddleware , completeModuleByStudent)

export default moduleRoutes;

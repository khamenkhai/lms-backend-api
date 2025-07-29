import { Router } from "express";
import { createModule, deleteModules, getModulesByCourse, getModulesById, updateModules } from "../controllers/module.controller";

const moduleRoutes = Router();

moduleRoutes.post("/modules", createModule);
moduleRoutes.get("/course-module/:courseId", getModulesByCourse);
moduleRoutes.get("/modules/:id", getModulesById);
moduleRoutes.put("/modules/:id", updateModules);
moduleRoutes.delete("/modules/:id", deleteModules);

export default moduleRoutes;

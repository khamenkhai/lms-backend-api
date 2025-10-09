import { Router } from "express";
import {
  createModule,
  deleteModules,
  getModulesByCourse,
  getModulesById,
  updateModules,
} from "../controllers/module.controller";
import authMiddleware from "../middlewares/auth-middleware";

const moduleRoutes = Router();

moduleRoutes.post("/modules", createModule);
moduleRoutes.get(
  "/course-module/:courseId",
  authMiddleware,
  getModulesByCourse
);
moduleRoutes.get("/modules/:id", getModulesById);
moduleRoutes.put("/modules/:id", updateModules);
moduleRoutes.delete("/modules/:id", deleteModules);


export default moduleRoutes;

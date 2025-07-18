import { Router } from "express";
import {
    createTemplate,
    getTemplateById,
    getTemplates,
    deleteTemplate,
    updateTemplate,
} from "../controllers/template.controller";
import authMiddleware from "../middlewares/authMiddleware";

const templateRoutes = Router();


// RESTful template routes
templateRoutes.get("/", getTemplates);
templateRoutes.get("/:id", getTemplateById);
templateRoutes.post("/", authMiddleware, createTemplate);
templateRoutes.put("/:id", authMiddleware, updateTemplate);
templateRoutes.delete("/:id", authMiddleware, deleteTemplate);

export default templateRoutes;

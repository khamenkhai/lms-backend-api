import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware";
import { getCategories } from "../controllers/category.controller";

const categoryRoutes = Router();

categoryRoutes.get("/categories", authMiddleware, getCategories);

export default categoryRoutes;

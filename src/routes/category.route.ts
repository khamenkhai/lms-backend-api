import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { getCategories } from "../controllers/category.controller";

const categoryRoutes = Router();

categoryRoutes.get("/categories", authMiddleware, getCategories);

export default categoryRoutes;

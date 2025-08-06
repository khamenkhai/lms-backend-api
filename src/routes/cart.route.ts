import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { addCourseToCart } from "../controllers/cart.controller";

const cartRoutes = Router();

cartRoutes.post("/cart/courses", authMiddleware, addCourseToCart);

export default cartRoutes;

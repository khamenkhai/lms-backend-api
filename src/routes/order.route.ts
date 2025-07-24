import { Router } from "express";
import { createOrder } from "../controllers/order.controller";
import authMiddleware from "../middlewares/authMiddleware";

const orderRoutes = Router();

orderRoutes.post("/order", authMiddleware, createOrder);

export default orderRoutes;

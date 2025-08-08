import { Router } from "express";
import { createOrder, getAllOrders } from "../controllers/order.controller";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";

const orderRoutes = Router();

orderRoutes.post("/orders", authMiddleware, createOrder);
orderRoutes.get("/orders", authMiddleware, getAllOrders);

export default orderRoutes;

import { Router } from "express";
import authMiddleware, { authorizeRoles } from "../middlewares/authMiddleware";
import { createEnrollment, getEnrolledCoursesByUserId } from "../controllers/enrollment.controller";

const enrollmentRoutes = Router();

enrollmentRoutes.post("/create-enrollment", authMiddleware, authorizeRoles("admin"), createEnrollment);
enrollmentRoutes.get("/users/:userId/courses", getEnrolledCoursesByUserId);

export default enrollmentRoutes;

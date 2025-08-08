import { Router } from "express";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";
import { createEnrollment, getAllEnrollments, getEnrolledCoursesByUserId } from "../controllers/enrollment.controller";

const enrollmentRoutes = Router();

enrollmentRoutes.post("/create-enrollment", authMiddleware, authorizeRoles("admin"), createEnrollment);
enrollmentRoutes.get("/users/:userId/courses", getEnrolledCoursesByUserId);
enrollmentRoutes.get("/enrollments", authMiddleware, getAllEnrollments);

export default enrollmentRoutes;

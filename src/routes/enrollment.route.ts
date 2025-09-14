import { Router } from "express";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";
import {
  enrollInCourse,
  getAllEnrollments,
//   getEnrolledCoursesByUserId,
} from "../controllers/enrollment.controller";

const enrollmentRoutes = Router();
// Student route to enroll in a course
enrollmentRoutes.post(
  "/courses/:courseId/enroll",
  authMiddleware,
  authorizeRoles("student"),
  enrollInCourse
);

// enrollmentRoutes.get("/users/:userId/courses", getEnrolledCoursesByUserId);
enrollmentRoutes.get("/enrollments", authMiddleware, getAllEnrollments);

export default enrollmentRoutes;

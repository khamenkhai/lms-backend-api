import { Router } from "express";
import { completeCourseByStudent, createCourse, deleteCourse, getCourseById, getCourses, getMyCourses, updateCourse } from "../controllers/course.controller";
import authMiddleware, { authorizeRoles } from "../middlewares/auth-middleware";

const courseRoutes = Router();

courseRoutes.post("/courses", authMiddleware, authorizeRoles("admin"), createCourse);
courseRoutes.get("/courses", authMiddleware, getCourses);
courseRoutes.get("/courses/:id", getCourseById);
courseRoutes.put("/courses/:id", authMiddleware, authorizeRoles("admin"), updateCourse);
courseRoutes.delete("/courses:id", authMiddleware, authorizeRoles("admin"), deleteCourse);
courseRoutes.get("/my-courses", authMiddleware, getMyCourses);

// students
courseRoutes.post("/complete-course", authMiddleware, authorizeRoles("student"), completeCourseByStudent)

export default courseRoutes;

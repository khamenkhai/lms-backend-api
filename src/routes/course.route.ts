import { Router } from "express";
import { createCourse, deleteCourse, getCourseById, getCourses, updateCourse } from "../controllers/course.controller";
import authMiddleware, { authorizeRoles } from "../middlewares/authMiddleware";

const courseRoutes = Router();

courseRoutes.post("/courses", authMiddleware,authorizeRoles("admin"), createCourse);
courseRoutes.get("/courses", getCourses);
courseRoutes.get("/courses/:id", getCourseById);
courseRoutes.put("/courses/:id", authorizeRoles("admin"), updateCourse);
courseRoutes.delete("/courses:id", authorizeRoles("admin"), deleteCourse);

export default courseRoutes;

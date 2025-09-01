import { Router } from "express";
import { getAllStudents } from "../controllers/student.controller";

const router = Router();

/**
 * @route   GET /api/students
 * @desc    Get all students with search & pagination
 * @query   page, limit, search
 */
router.get("/", getAllStudents);

export default router;

import { Router } from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizz.controller";
import authMiddleware from "../middlewares/authMiddleware";

const quizRoutes = Router();

// Create a new quiz
quizRoutes.post("/quizzes", authMiddleware, createQuiz);

// Get all quizzes
quizRoutes.get("/quizzes", authMiddleware, getAllQuizzes);

// Get a specific quiz by ID
quizRoutes.get("/quizzes/:id", authMiddleware, getQuizById);

// Update a quiz by ID
quizRoutes.put("/quizzes/:id", authMiddleware, updateQuiz);

// Delete a quiz by ID
quizRoutes.delete("/quizzes/:id", authMiddleware, deleteQuiz);

export default quizRoutes;

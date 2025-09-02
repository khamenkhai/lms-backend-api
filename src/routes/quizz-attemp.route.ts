import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware"; // optional, for protected route
import { submitQuizAttempt } from "../controllers/quizz-attemps.controller";

const quizzAttempRoutes = Router();

// Protected route to submit a quiz
quizzAttempRoutes.post("/submit", authMiddleware, submitQuizAttempt);

export default quizzAttempRoutes;

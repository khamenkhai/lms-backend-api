import { Router } from "express";
import {
  addQuestion,
  updateQuestion,
} from "../controllers/quizzAnswer.controller";

const questionAnswerRoutes = Router();

// Add questions and answers to a quiz
questionAnswerRoutes.post("/quizzes/:quizId/questions", addQuestion);

// Update questions and answers for a quiz
questionAnswerRoutes.put("/quizzes/:questionId/questions", updateQuestion);

export default questionAnswerRoutes;

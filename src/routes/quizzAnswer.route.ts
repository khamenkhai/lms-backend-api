import { Router } from "express";
import {
  addQuestionsWithAnswers,
  updateQuestionsWithAnswers,
} from "../controllers/quizzAnswer.controller";

const questionAnswerRoutes = Router();

// Add questions and answers to a quiz
questionAnswerRoutes.post("/quizzes/:quizId/questions", addQuestionsWithAnswers);

// Update questions and answers for a quiz
questionAnswerRoutes.put("/quizzes/:quizId/questions", updateQuestionsWithAnswers);

export default questionAnswerRoutes;

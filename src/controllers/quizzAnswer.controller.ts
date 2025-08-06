import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { questionSchema, questionUpdateSchema, } from "../validators/quizz-schema";

export const addQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const quizId = parseInt(req.params.quizId);

    // ✅ Validate request body using Zod
    const parsed = questionSchema.parse(req.body);

    const { question_text, type, answers } = parsed;

    const quiz = await prismaClient.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const createdQuestion = await prismaClient.question.create({
      data: {
        quiz_id: quizId,
        question_text,
        type,
      },
    });

    await prismaClient.quizzAnswer.createMany({
      data: answers.map((answer) => ({
        answer_text: answer.answer_text,
        question_id: createdQuestion.id,
        is_correct: answer.is_correct ?? false, // default to false if undefined
      })),
    });

    sendResponse(res, 201, "Question and answers added successfully", quiz);
  } catch (error) {
    console.error("[addQuestion] Error:", error);
    next(error);
  }
};



export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const questionId = parseInt(req.params.questionId);

    // ✅ Validate request body using Zod
    const parsed = questionUpdateSchema.parse(req.body);
    const { question_text, type, answers, quizz_id, deletedAnswerIds } = parsed;

    const question = await prismaClient.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    });

    const quiz = await prismaClient.quiz.findUnique({
      where: { id: quizz_id },
    });

    if(deletedAnswerIds && deletedAnswerIds.length > 0){
      await prismaClient.quizzAnswer.deleteMany({
        where : {
          id : {
            in : deletedAnswerIds
          }
        }
      })
    }

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }


    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // ✅ Update question fields
    await prismaClient.question.update({
      where: { id: questionId },
      data: {
        question_text: question_text ?? question.question_text,
        type: type ?? question.type,
      },
    });

    if (answers && answers.length > 0) {
      for (const answer of answers) {
        if (answer.id) {
          // ✅ Update existing answer
          await prismaClient.quizzAnswer.update({
            where: { id: answer.id },
            data: {
              answer_text: answer.answer_text,
              is_correct: answer.is_correct,
            },
          });
        } else {
          // ✅ Create new answer
          await prismaClient.quizzAnswer.create({
            data: {
              answer_text: answer.answer_text ?? "",
              is_correct: answer.is_correct ?? false,
              question_id: questionId,
            },
          });
        }
      }
    }

    const updatedQuestion = await prismaClient.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    });

    sendResponse(res, 200, "Question and answers updated successfully", quiz);
  } catch (error) {
    console.error("[updateQuestion] Error:", error);
    next(error);
  }
};
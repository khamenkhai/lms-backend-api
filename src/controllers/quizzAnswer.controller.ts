import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { updateQuestionsWithAnswersSchema } from "../validators/quizz";

export const addQuestionsWithAnswers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const quizId = parseInt(req.params.quizId);
        const { questions } = req.body;

        const quiz = await prismaClient.quiz.findUnique({
            where: { id: quizId },
        });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        for (const question of questions) {
            const createdQuestion = await prismaClient.question.create({
                data: {
                    quiz_id: quizId,
                    question_text: question.question_text,
                    type: question.type,
                },
            });

            if (question.answers && Array.isArray(question.answers)) {
                await prismaClient.quizzAnswer.createMany({
                    data: question.answers.map((answer: any) => ({
                        answer_text: answer.answer_text,
                        question_id: createdQuestion.id,
                    })),
                });
            }
        }

        sendResponse(res, 201, "Questions and answers added successfully");
    } catch (error) {
        console.error("[addQuestionsWithAnswers] Error:", error);
        next(error);
    }
};


export const updateQuestionsWithAnswers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const quizId = parseInt(req.params.quizId);

        // Validate request body
        const validatedData = updateQuestionsWithAnswersSchema.parse(req.body);

        // Check quiz existence
        const quiz = await prismaClient.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        for (const question of validatedData.questions) {
            let updatedQuestion;

            if (question.id) {
                // Update existing question partially
                updatedQuestion = await prismaClient.question.update({
                    where: { id: question.id },
                    data: {
                        question_text: question.question_text,
                        type: question.type,
                    },
                });
            } else {
                // Create new question if no id
                updatedQuestion = await prismaClient.question.create({
                    data: {
                        quiz_id: quizId,
                        question_text: question.question_text || "New question", // fallback
                        type: question.type,
                    },
                });
            }

            if (question.answers) {
                for (const answer of question.answers) {
                    if (answer.id) {
                        // Update existing answer partially
                        await prismaClient.quizzAnswer.update({
                            where: { id: answer.id },
                            data: {
                                answer_text: answer.answer_text,
                            },
                        });
                    } else {
                        // Create new answer
                        await prismaClient.quizzAnswer.create({
                            data: {
                                answer_text: answer.answer_text || "New answer",
                                question_id: updatedQuestion.id,
                            },
                        });
                    }
                }
            }
        }

        sendResponse(res, 200, "Questions and answers updated successfully");
        
    } catch (error) {
        console.error("[updateQuestionsWithAnswers] Error:", error);
        next(error);
    }
};

import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";

export const submitQuizAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { quiz_id, user_id, answers } = req.body;

        // 1. Create a new quiz attempt
        const quizAttempt = await prismaClient.userQuizAttempt.create({
            data: {
                user_id,
                quiz_id,
                status: "IN_PROGRESS",
            },
        });

        let totalQuestions = 0;
        let totalCorrect = 0;

        // 2. Iterate over each question
        for (const answerEntry of answers) {
            const { question_id, selected_answer_ids, answered_at } = answerEntry;

            totalQuestions++;

            // Fetch correct answers from DB
            const correctAnswers = await prismaClient.quizzAnswer.findMany({
                where: {
                    question_id,
                    is_correct: true,
                },
                select: {
                    id: true,
                },
            });

            const correctIds = correctAnswers.map((a) => a.id).sort();
            const selectedIds = (selected_answer_ids || []).sort();

            const isCorrect =
                correctIds.length === selectedIds.length &&
                correctIds.every((val, index) => val === selectedIds[index]);

            if (isCorrect) totalCorrect++;

            // 3. Insert selected answers into UserQuizAnswer
            for (const answer_id of selectedIds) {
                await prismaClient.userQuizAnswer.create({
                    data: {
                        attempt_id: quizAttempt.id,
                        question_id,
                        answer_id,
                        is_correct: isCorrect,
                        answered_at: new Date(answered_at),
                    },
                });
            }

            // Handle skipped question (no answers selected)
            if (selectedIds.length === 0) {
                await prismaClient.userQuizAnswer.create({
                    data: {
                        attempt_id: quizAttempt.id,
                        question_id,
                        answer_id: null,
                        is_correct: false,
                        answered_at: new Date(answered_at),
                    },
                });
            }
        }

        const score = (totalCorrect / totalQuestions) * 100;

        // 4. Update quiz attempt
        const completedAttempt = await prismaClient.userQuizAttempt.update({
            where: {
                id: quizAttempt.id,
            },
            data: {
                status: "COMPLETED",
                completed_at: new Date(),
                // score: new Prisma.Decimal(score.toFixed(2)),
            },
        });

       
        sendResponse(res, 200, "Quiz submitted successfully", completedAttempt,);
    } catch (error) {
        console.error("Submit quiz error:", error);
        next(error);
    }
};

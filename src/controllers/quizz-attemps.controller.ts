import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";

export const submitQuizAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { quiz_id, answers } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      throw new Error("User id not found");
    }

    const result = await prismaClient.$transaction(async (tx) => {
      // 🔹 Check if user exists
      const user = await tx.user.findUnique({
        where: { id: user_id },
      });
      if (!user) {
        throw new Error("User not found");
      }

      // ✅ Allow only students
      if (user.role !== "student") {
        throw new Error("Only students can attempt quizzes");
      }

      // 🔹 Get today's start and end
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // 🔹 Count today's attempts
      const attemptsToday = await tx.userQuizAttempt.count({
        where: {
          user_id,
          quiz_id,
          completed_at: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      if (attemptsToday >= 3) {
        throw new Error("You have already attempted this quiz 3 times today");
      }

      // 1. Create a new quiz attempt
      const quizAttempt = await tx.userQuizAttempt.create({
        data: {
          user_id: user_id,
          quiz_id,
          status: "IN_PROGRESS",
        },
      });

      let totalQuestions = 0;
      let totalCorrect = 0;

      // 2. Iterate over each question
      for (const answerEntry of answers) {
        const { question_id, selected_answer_ids } = answerEntry;

        totalQuestions++;

        // Fetch correct answers from DB
        const correctAnswers = await tx.quizzAnswer.findMany({
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
        if (selectedIds.length > 0) {
          for (const answer_id of selectedIds) {
            await tx.userQuizAnswer.create({
              data: {
                attempt_id: quizAttempt.id,
                question_id,
                answer_id,
                is_correct: isCorrect,
              },
            });
          }
        } else {
          // Handle skipped question (no answers selected)
          await tx.userQuizAnswer.create({
            data: {
              attempt_id: quizAttempt.id,
              question_id,
              answer_id: null,
              is_correct: false,
            },
          });
        }
      }

      const score = (totalCorrect / totalQuestions) * 100;

      // ✅ If score >= 70 → mark content as completed
      if (score >= 70) {
        const quiz = await tx.quiz.findUnique({
          where: { id: quiz_id },
          select: { content_id: true },
        });

        if (!quiz) {
          throw new Error("Quiz not found");
        }

        await prismaClient.userContentProgress.upsert({
          where: {
            user_id_content_id: {
              user_id: user_id,
              content_id: quiz.content_id,
            },
          },
          update: {
            is_completed: true,
          },
          create: {
            user_id: user_id,
            content_id: quiz.content_id,
            is_completed: true,
          },
        });
      }

      // 4. Update quiz attempt
      const completedAttempt = await tx.userQuizAttempt.update({
        where: {
          id: quizAttempt.id,
        },
        data: {
          status: "COMPLETED",
          completed_at: new Date(),
          score: score,
        },
      });

      return completedAttempt;
    });

    sendResponse(res, 200, "Quiz submitted successfully", result);
  } catch (error) {
    console.error("Submit quiz error:", error);
    next(error);
  }
};

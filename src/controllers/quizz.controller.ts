import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { createQuizSchema } from "../validators/quizz-schema";

export const createQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const validatedData = createQuizSchema.parse(req.body);

        const content = await prismaClient.content.findUnique({
            where: { id: validatedData.content_id },
        });

        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }

        const quiz = await prismaClient.quiz.create({
            data: {
                content_id: validatedData.content_id,
                title: validatedData.title,
            },
        });

        sendResponse(res, 201, "Quiz created successfully!", quiz);
    } catch (error) {
        console.error("[createQuiz] Error:", error);
        next(error);
    }
};

export const getAllQuizzes = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const quizzes = await prismaClient.quiz.findMany({
            include: {
                // content: true,
                questions: true,
            },
        });

        sendResponse(res, 200, "Quizzes retrieved successfully", quizzes);
    } catch (error) {
        console.error("[getAllQuizzes] Error:", error);
        next(error);
    }
};

export const getQuizById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const quizId = parseInt(req.params.id);

        const quiz = await prismaClient.quiz.findUnique({
            where: { id: quizId },
            include: {
                content: true,
                questions: {
                    include: { answers: true },
                },
            },
        });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        sendResponse(res, 200, "Quiz retrieved successfully", quiz);
    } catch (error) {
        console.error("[getQuizById] Error:", error);
        next(error);
    }
};

export const updateQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const quizId = parseInt(req.params.id);
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const quiz = await prismaClient.quiz.update({
            where: { id: quizId },
            data: { title },
        });

        sendResponse(res, 200, "Quiz updated successfully", quiz);
    } catch (error) {
        console.error("[updateQuiz] Error:", error);
        next(error);
    }
};

export const deleteQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const quizId = parseInt(req.params.id);

        await prismaClient.quiz.delete({
            where: { id: quizId },
            
        });

        sendResponse(res, 200, "Quiz deleted successfully");
    } catch (error) {
        console.error("[deleteQuiz] Error:", error);
        next(error);
    }
};

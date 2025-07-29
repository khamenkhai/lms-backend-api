import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";

export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const orderData = await prismaClient.category.findMany();

        sendResponse(res, 200, "Categories fetch successfully!", orderData);

    } catch (error) {
        console.error("[getCategories] Error:", error);
        next(error);
    }
};
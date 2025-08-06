import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { AppError } from "../utils/app-error";

export const addToWishlist = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req?.user;
        const user_id = user?.id;

        if (!user_id) {
            return next(new AppError("Unauthorized: User ID not found!", 401));
        }

        const { course_id } = req.body;

        if (!course_id) {
            return next(new AppError("Course ID is required!", 400));
        }

        // Check if course already in user's wishlist
        const isExisted = await prismaClient.wishlist.findFirst({
            where: {
                user_id,
                course_id,
            },
        });

        if (isExisted) {
            return next(new AppError("This course is already in your wishlist!", 400)); // ✅ return added
        }

        // Check if course exists
        const course = await prismaClient.course.findUnique({
            where: { id: course_id },
        });

        if (!course) {
            return next(new AppError("Course not found!", 404));
        }


        const wishlistData = await prismaClient.wishlist.create({
            data: {
                user_id,
                course_id,
            },
        });

        sendResponse(res, 201, "Course added to wishlist", wishlistData);

    } catch (error) {
        console.error("[addToWishlist] Error:", error);
        next(error);
    }
};

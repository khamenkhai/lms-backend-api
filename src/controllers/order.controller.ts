import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../utils/prismaClient";
import { sendResponse } from "../utils/response";
import { createOrderSchema } from "../validators/schema";

export const createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Validate request body
        const parseResult = createOrderSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parseResult.error.errors,
            });
        }

        const { status, course_id, payment_method_id, provider_transaction_id } =
            parseResult.data;

        // Verify course exists
        const course = await prismaClient.course.findUnique({
            where: { id: course_id },
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Verify payment method exists if provided
        if (payment_method_id) {
            const paymentMethod = await prismaClient.paymentMethod.findUnique({
                where: { id: payment_method_id },
            });
            if (!paymentMethod) {
                return res.status(400).json({ message: "Invalid payment method" });
            }
        }


        const amount = course.price;

        // Create order
        const orderData = await prismaClient.order.create({
            data: {
                amount,
                course_id,
                user_id: userId,
                status: status ?? "pending",
                payment:
                    payment_method_id && provider_transaction_id
                        ? {
                            create: {
                                payment_method_id,
                                provider_transaction_id,
                                amount,

                            },
                        }
                        : undefined,
            },
            include: {
                payment: true,
            },
        });

        sendResponse(res, 201, "Order created successfully!", orderData);

    } catch (error) {
        console.error("[createOrder] Error:", error);
        next(error);
    }
};
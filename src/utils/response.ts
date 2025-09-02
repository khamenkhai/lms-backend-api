import { Response } from 'express';

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T | null;
}

export function sendResponse<T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null
): Response {
    const response: ApiResponse<T> = {
        statusCode,
        message,
        data,
    };
    return res.status(statusCode).json(response);
}


interface SendResponseParams<T> {
    res: Response;
    statusCode: number;
    message: string;
    data?: T | null;
}

export function sendJsonResponse<T>({
    res,
    statusCode,
    message,
    data = null,
}: SendResponseParams<T>): Response {
    const response: ApiResponse<T> = {
        statusCode,
        message,
        data,
    };
    return res.status(statusCode).json(response);
}


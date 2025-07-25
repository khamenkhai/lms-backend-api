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


// export function sendResponse<T>(
//     res: Response,
//     statusCode: number,
//     message: string,
//     data: T | null = null
// ) {
//     const response: ApiResponse<T> = {
//         statusCode,
//         message,
//         data,
//     };
//     res.status(statusCode).json(response);
// }

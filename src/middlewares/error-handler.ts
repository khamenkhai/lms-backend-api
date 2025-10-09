import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): any => {
  console.log(`***** errors => ${err}`);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      status: false,
      message: 'Validation error',
      errors,
    });
  }

  // Handle Prisma database connection errors
  if (err instanceof Error && err.message.includes('prisma') && err.message.includes('database')) {
    const isConnectionError = err.message.includes("Can't reach database server") || 
                             err.message.includes("database server is running");
    
    if (isConnectionError) {
      return res.status(503).json({
        status: false,
        statusCode: 503,
        message: 'Database connection issue. Please check your internet connection and try again.',
      });
    }
  }

  // Handle other Prisma errors
  if (err instanceof Error && err.message.includes('prisma')) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: 'A database error occurred. Please try again later.',
    });
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // Handle other unexpected errors
  const status = 500;
  const message = 'Internal Server Error';

  return res.status(status).json({
    status: false,
    statusCode: status,
    message,
  });
};
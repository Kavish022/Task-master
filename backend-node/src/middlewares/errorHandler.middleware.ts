import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { HttpStatus } from '../constants/httpStatusCodes';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // 1. Handled Operational ApiErrors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details ?? null,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      details: formattedErrors,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[]) || ['Field'];
        return res.status(HttpStatus.CONFLICT).json({
          success: false,
          statusCode: HttpStatus.CONFLICT,
          message: `Duplicate entry for ${Array.isArray(target) ? target.join(', ') : target}`,
          details: err.meta,
          timestamp: new Date().toISOString(),
        });
      }
      case 'P2025': {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Requested database record does not exist',
          details: err.meta,
          timestamp: new Date().toISOString(),
        });
      }
      case 'P2003': {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
          details: err.meta,
          timestamp: new Date().toISOString(),
        });
      }
      default:
        break;
    }
  }

  // 4. Malformed JSON Body
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Malformed JSON payload',
      timestamp: new Date().toISOString(),
    });
  }

  // 5. Unhandled / Server Errors
  console.error('💥 Unhandled Exception:', err);

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
}

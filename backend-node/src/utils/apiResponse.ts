import { Response } from 'express';
import { HttpStatus, HttpStatusCode } from '../constants/httpStatusCodes';
import { PaginatedResult } from '../types/api.types';

interface SendResponseOptions<T> {
  statusCode?: HttpStatusCode;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static send<T>(
    res: Response,
    {
      statusCode = HttpStatus.OK,
      message = 'Operation successful',
      data,
      meta,
    }: SendResponseOptions<T>
  ): Response {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data: data ?? null,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message = 'Resource created successfully'
  ): Response {
    return this.send(res, {
      statusCode: HttpStatus.CREATED,
      message,
      data,
    });
  }

  static paginated<T>(
    res: Response,
    result: PaginatedResult<T>,
    message = 'Data retrieved successfully'
  ): Response {
    return res.status(HttpStatus.OK).json({
      success: true,
      statusCode: HttpStatus.OK,
      message,
      data: result.items,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  }

  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}

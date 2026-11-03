import { HttpStatus, HttpStatusCode } from '../constants/httpStatusCodes';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(HttpStatus.BAD_REQUEST, message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(HttpStatus.UNAUTHORIZED, message, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(HttpStatus.FORBIDDEN, message, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource Not Found', details?: unknown) {
    super(HttpStatus.NOT_FOUND, message, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource Conflict', details?: unknown) {
    super(HttpStatus.CONFLICT, message, details);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message = 'Unprocessable Entity', details?: unknown) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, details);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', details?: unknown) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, details, false);
  }
}

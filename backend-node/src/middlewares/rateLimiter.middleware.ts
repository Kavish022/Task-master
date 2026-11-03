import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { HttpStatus } from '../constants/httpStatusCodes';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString(),
  },
});

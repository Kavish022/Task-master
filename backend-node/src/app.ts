import express, { Application } from 'express';
import { securityMiddleware } from './middlewares/security.middleware';
import { corsMiddleware } from './middlewares/cors.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { workspaceRoutes } from './modules/workspace/workspace.routes';
import { projectRoutes } from './modules/project/project.routes';
import { taskRoutes } from './modules/task/task.routes';
import { commentRoutes } from './modules/comment/comment.routes';
import { itemRoutes } from './modules/item/item.routes';

export function createApp(): Application {
  const app = express();

  // 1. Global Security, CORS & Logging Middlewares
  app.use(securityMiddleware);
  app.use(corsMiddleware);
  app.use(loggerMiddleware);

  // 2. Request Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. API Rate Limiting
  app.use('/api', apiRateLimiter);

  // 4. API Route Registration (Supports both /api and /api/v1)
  app.use('/api/health', healthRoutes);
  app.use(['/api/auth', '/api/v1/auth'], authRoutes);
  app.use(['/api/users', '/api/v1/users'], userRoutes);
  app.use(['/api/workspaces', '/api/v1/workspaces'], workspaceRoutes);
  app.use(['/api/workspaces/:workspaceId/projects', '/api/v1/workspaces/:workspaceId/projects'], projectRoutes);
  app.use(['/api/items', '/api/v1/items'], itemRoutes);
  app.use(['/api', '/api/v1'], taskRoutes);
  app.use(['/api', '/api/v1'], commentRoutes);

  // 5. Fallback 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

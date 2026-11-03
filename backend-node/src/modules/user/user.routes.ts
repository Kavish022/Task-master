import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  updateUserProfileSchema,
  listUsersQuerySchema,
} from './user.validation';

const router = Router();

// Authenticated user profile routes
router.get('/me', authenticate, UserController.getMe);
router.patch(
  '/me',
  authenticate,
  validate({ body: updateUserProfileSchema }),
  UserController.updateMe
);

// Search / list users for assigning tasks
router.get(
  '/',
  authenticate,
  validate({ query: listUsersQuerySchema }),
  UserController.listUsers
);

export const userRoutes = router;

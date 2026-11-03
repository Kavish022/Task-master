import { Router } from 'express';
import { TaskController } from './task.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  reorderTaskSchema,
  listTasksQuerySchema,
  createSubtaskSchema,
  toggleTaskSchema,
  addDependencySchema,
} from './task.validation';

const router = Router();

router.use(authenticate);

// Project-scoped routes
router.get(
  '/projects/:projectId/tasks',
  validate({ query: listTasksQuerySchema }),
  TaskController.list
);

router.post(
  '/projects/:projectId/tasks',
  validate({ body: createTaskSchema }),
  TaskController.create
);

// Individual task routes
router.get('/tasks/:taskId', TaskController.getById);

router.patch(
  '/tasks/:taskId',
  validate({ body: updateTaskSchema }),
  TaskController.update
);

router.patch(
  '/tasks/:taskId/toggle',
  validate({ body: toggleTaskSchema }),
  TaskController.toggleStatus
);

router.patch(
  '/tasks/:taskId/reorder',
  validate({ body: reorderTaskSchema }),
  TaskController.reorder
);

router.delete('/tasks/:taskId', TaskController.delete);

// Subtasks routes
router.post(
  '/tasks/:taskId/subtasks',
  validate({ body: createSubtaskSchema }),
  TaskController.createSubtask
);

// Dependencies routes
router.post(
  '/tasks/:taskId/dependencies',
  validate({ body: addDependencySchema }),
  TaskController.addDependency
);

router.delete('/tasks/dependencies/:dependencyId', TaskController.removeDependency);

export const taskRoutes = router;

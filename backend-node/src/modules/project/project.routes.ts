import { Router } from 'express';
import { WorkspaceRole } from '@prisma/client';
import { ProjectController } from './project.controller';
import {
  authenticate,
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createProjectSchema, updateProjectSchema } from './project.validation';

const router = Router({ mergeParams: true });

router.use(authenticate, requireWorkspaceMember);

router.get('/', ProjectController.list);
router.post(
  '/',
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: createProjectSchema }),
  ProjectController.create
);

router.get('/:projectId', ProjectController.getById);
router.patch(
  '/:projectId',
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: updateProjectSchema }),
  ProjectController.update
);
router.delete(
  '/:projectId',
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  ProjectController.delete
);

export const projectRoutes = router;

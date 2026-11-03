import { Router } from 'express';
import { WorkspaceRole } from '@prisma/client';
import { WorkspaceController } from './workspace.controller';
import {
  authenticate,
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from './workspace.validation';

const router = Router();

// Base routes (list & create)
router.get('/', authenticate, WorkspaceController.listUserWorkspaces);
router.post(
  '/',
  authenticate,
  validate({ body: createWorkspaceSchema }),
  WorkspaceController.create
);

// Lookup by slug
router.get('/slug/:slug', authenticate, WorkspaceController.getBySlug);

// Scoped workspace routes (verifies caller is an active workspace member)
router.get(
  '/:workspaceId',
  authenticate,
  requireWorkspaceMember,
  WorkspaceController.getById
);

router.patch(
  '/:workspaceId',
  authenticate,
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: updateWorkspaceSchema }),
  WorkspaceController.update
);

router.delete(
  '/:workspaceId',
  authenticate,
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER),
  WorkspaceController.delete
);

// Members management
router.get(
  '/:workspaceId/members',
  authenticate,
  requireWorkspaceMember,
  WorkspaceController.listMembers
);

router.post(
  ['/:workspaceId/members', '/:workspaceId/members/invite'],
  authenticate,
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: inviteMemberSchema }),
  WorkspaceController.inviteMember
);

router.patch(
  '/:workspaceId/members/:userId/role',
  authenticate,
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER),
  validate({ body: updateMemberRoleSchema }),
  WorkspaceController.updateMemberRole
);

router.delete(
  '/:workspaceId/members/:userId',
  authenticate,
  requireWorkspaceMember,
  requireWorkspaceRole(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  WorkspaceController.removeMember
);

export const workspaceRoutes = router;

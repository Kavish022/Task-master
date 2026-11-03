import { Request, Response, NextFunction } from 'express';
import { WorkspaceRole, MembershipStatus } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../utils/apiError';
import { verifyAccessToken } from '../utils/jwt.utils';
import { prisma } from '../config/db';

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token missing or malformed');
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (payload.accountStatus !== 'ACTIVE') {
    throw new ForbiddenError('Your account has been suspended or deactivated');
  }

  req.user = payload;
  next();
}

/**
 * Optional Authentication Middleware
 * Attaches req.user if a valid Bearer token is provided, otherwise proceeds without error.
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (payload && payload.accountStatus === 'ACTIVE') {
        req.user = payload;
      }
    } catch {
      // Proceed unauthenticated if token is invalid or expired
    }
  }
  next();
}

/**
 * Multi-tenant Workspace Authorization Middleware
 * Verifies that the authenticated user is an active member of the target workspace.
 */
export function requireWorkspaceMember(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  (async () => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User is not authenticated');
      }

      // Check header, query, or params for workspaceId
      const workspaceIdParam =
        req.params.workspaceId ||
        req.query.workspaceId ||
        req.headers['x-workspace-id'];

      const workspaceId = parseInt(String(workspaceIdParam), 10);
      if (isNaN(workspaceId)) {
        throw new ForbiddenError('Valid workspaceId is required');
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          uq_workspace_member: {
            workspaceId,
            userId: req.user.id,
          },
        },
      });

      if (!membership || membership.membershipStatus !== MembershipStatus.ACTIVE) {
        throw new ForbiddenError('You do not have access to this workspace');
      }

      req.workspaceMember = {
        workspaceId,
        role: membership.role,
      };

      next();
    } catch (err) {
      next(err);
    }
  })();
}

/**
 * Role-Based Access Control inside a Workspace (e.g. OWNER, ADMIN, MEMBER)
 */
export function requireWorkspaceRole(...allowedRoles: WorkspaceRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.workspaceMember) {
      throw new ForbiddenError('Workspace membership context missing');
    }

    if (!allowedRoles.includes(req.workspaceMember.role)) {
      throw new ForbiddenError(
        `Action requires one of the following workspace roles: [${allowedRoles.join(', ')}]`
      );
    }

    next();
  };
}

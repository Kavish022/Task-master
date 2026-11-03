import { UserAccountStatus, WorkspaceRole } from '@prisma/client';

export interface AuthUserPayload {
  id: number;
  email: string;
  name: string;
  accountStatus: UserAccountStatus;
}

export interface WorkspaceMemberContext {
  workspaceId: number;
  role: WorkspaceRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

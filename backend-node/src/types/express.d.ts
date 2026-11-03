import { AuthUserPayload, WorkspaceMemberContext } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      workspaceMember?: WorkspaceMemberContext;
    }
  }
}

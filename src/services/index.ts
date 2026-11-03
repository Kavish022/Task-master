import { ENV } from '@/config/env';
import type { IItemRepository } from './contracts/item.repository';
import type { IAuthRepository } from './contracts/auth.repository';
import type { IWorkspaceRepository } from './contracts/workspace.repository';
import type { IKanbanRepository } from './contracts/kanban.repository';

import { ItemRestAdapter } from './adapters/rest/item.rest.adapter';
import { ItemMockAdapter } from './adapters/mock/item.mock.adapter';
import { AuthRestAdapter } from './adapters/rest/auth.rest.adapter';
import { AuthMockAdapter } from './adapters/mock/auth.mock.adapter';
import { WorkspaceRestAdapter } from './adapters/rest/workspace.rest.adapter';
import { KanbanRestAdapter } from './adapters/rest/kanban.rest.adapter';

export const itemService: IItemRepository = ENV.enableMockApi
  ? new ItemMockAdapter()
  : new ItemRestAdapter();

export const authService: IAuthRepository = ENV.enableMockApi
  ? new AuthMockAdapter()
  : new AuthRestAdapter();

export const workspaceService: IWorkspaceRepository = new WorkspaceRestAdapter();
export const kanbanService: IKanbanRepository = new KanbanRestAdapter();

export * from './contracts/item.repository';
export * from './contracts/auth.repository';
export * from './contracts/workspace.repository';
export * from './contracts/kanban.repository';

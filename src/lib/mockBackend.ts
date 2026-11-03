import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENDPOINTS } from '@/config/endpoints';
import type { User } from '@/features/auth/types';

export interface MockItem {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// In-memory demo store initialized with realistic starter data
let mockItems: MockItem[] = [
  {
    id: 'item-1',
    title: 'Design Design System Tokens',
    description:
      'Configure HSL color palettes, spacing tokens, and Tailwind darkMode class strategy.',
    status: 'completed',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'item-2',
    title: 'Implement JWT Refresh Flow',
    description:
      'Set up Axios response interceptor to intercept 401 and refresh expired access tokens seamlessly.',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'item-3',
    title: 'Configure React Hook Form & Zod',
    description:
      'Add type-safe form validation schemas for authentication and dynamic item management.',
    status: 'completed',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    title: 'Connect Real Production REST API',
    description:
      'Switch VITE_API_BASE_URL to point to your live backend endpoint once ready.',
    status: 'draft',
    priority: 'low',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockUser: User = {
  id: 'usr-999',
  email: 'admin@example.com',
  name: 'Alex Rivera',
  role: 'Frontend Architect',
  avatarUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
};

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handleMockApiRequest(
  config: AxiosRequestConfig
): Promise<AxiosResponse | null> {
  const url = config.url ?? '';
  const method = (config.method ?? 'GET').toUpperCase();

  await delay(200);

  // AUTH: Login
  if (url === ENDPOINTS.AUTH.LOGIN && method === 'POST') {
    const data = JSON.parse(String(config.data || '{}')) as { email?: string };
    const response = {
      accessToken: 'demo_access_token_' + Date.now(),
      refreshToken: 'demo_refresh_token_' + Date.now(),
      user: {
        ...mockUser,
        email: data.email || mockUser.email,
        name: data.email ? (data.email.split('@')[0] ?? mockUser.name) : mockUser.name,
      },
    };
    return createAxiosResponse(response, config);
  }

  // AUTH: Register
  if (url === ENDPOINTS.AUTH.REGISTER && method === 'POST') {
    const data = JSON.parse(String(config.data || '{}')) as {
      email: string;
      name?: string;
    };
    const response = {
      accessToken: 'demo_access_token_' + Date.now(),
      refreshToken: 'demo_refresh_token_' + Date.now(),
      user: {
        id: 'usr-' + Date.now(),
        email: data.email,
        name: data.name || 'New Member',
        role: 'User',
      },
    };
    return createAxiosResponse(response, config, 201);
  }

  // AUTH: Refresh
  if (url === ENDPOINTS.AUTH.REFRESH && method === 'POST') {
    return createAxiosResponse(
      {
        accessToken: 'demo_refreshed_access_token_' + Date.now(),
        refreshToken: 'demo_refresh_token_' + Date.now(),
        user: mockUser,
      },
      config
    );
  }

  // AUTH: Me
  if (url === ENDPOINTS.AUTH.ME && method === 'GET') {
    return createAxiosResponse(mockUser, config);
  }

  // ITEMS: List (GET /items)
  if (url === ENDPOINTS.ITEMS.LIST && method === 'GET') {
    const params = (config.params ?? {}) as { search?: string; status?: string };
    let filtered = [...mockItems];

    if (params.search) {
      const q = String(params.search).toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((i) => i.status === params.status);
    }

    return createAxiosResponse(filtered, config);
  }

  // ITEMS: Create (POST /items)
  if (url === ENDPOINTS.ITEMS.CREATE && method === 'POST') {
    const body = JSON.parse(String(config.data || '{}')) as Partial<MockItem>;
    const newItem: MockItem = {
      id: 'item-' + Date.now(),
      title: body.title || 'Untitled Item',
      description: body.description || '',
      status: body.status || 'draft',
      priority: body.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockItems = [newItem, ...mockItems];
    return createAxiosResponse(newItem, config, 201);
  }

  // ITEMS: Detail (GET /items/:id)
  const detailMatch = url.match(/^\/items\/([^/]+)$/);
  if (detailMatch && method === 'GET') {
    const id = detailMatch[1];
    const found = mockItems.find((i) => i.id === id);
    if (!found) {
      throw createMockAxiosError('Item not found', 404, config);
    }
    return createAxiosResponse(found, config);
  }

  // ITEMS: Update (PUT /items/:id)
  if (detailMatch && method === 'PUT') {
    const id = detailMatch[1];
    const body = JSON.parse(String(config.data || '{}')) as Partial<MockItem>;
    const index = mockItems.findIndex((i) => i.id === id);
    if (index === -1) {
      throw createMockAxiosError('Item not found for update', 404, config);
    }
    const current = mockItems[index];
    if (!current) {
      throw createMockAxiosError('Item not found', 404, config);
    }
    const updated: MockItem = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    mockItems[index] = updated;
    return createAxiosResponse(updated, config);
  }

  // ITEMS: Delete (DELETE /items/:id)
  if (detailMatch && method === 'DELETE') {
    const id = detailMatch[1];
    mockItems = mockItems.filter((i) => i.id !== id);
    return createAxiosResponse({ success: true, id }, config);
  }

  return null;
}

function createAxiosResponse(
  data: unknown,
  config: AxiosRequestConfig,
  status = 200
): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 201 ? 'Created' : 'OK',
    headers: {},
    config: config as AxiosResponse['config'],
  };
}

function createMockAxiosError(
  message: string,
  status: number,
  config: AxiosRequestConfig
) {
  const error = new Error(message) as Error & {
    response?: { data: { message: string }; status: number };
    config: AxiosRequestConfig;
  };
  error.response = {
    data: { message },
    status,
  };
  error.config = config;
  return error;
}

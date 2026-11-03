import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFoundPage } from './NotFoundPage';
import { ErrorPage } from './ErrorPage';

// Lazy-loaded route views
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const KanbanBoardPage = lazy(() => import('@/features/kanban/KanbanBoardPage'));
const ItemsPage = lazy(() => import('@/features/items/ItemsPage'));
const ItemDetailPage = lazy(() => import('@/features/items/ItemDetailPage'));

export const router = createBrowserRouter([
  // Public routes wrapped in AuthLayout
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },

  // Protected routes wrapped in ProtectedRoute and MainLayout
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            path: '/kanban',
            element: <KanbanBoardPage />,
          },
          {
            path: '/items',
            element: <ItemsPage />,
          },
          {
            path: '/items/:id',
            element: <ItemDetailPage />,
          },
        ],
      },
    ],
  },

  // 404 Catch-all route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

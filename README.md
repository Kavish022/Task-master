# Production-Grade Scalable React Frontend Architecture

A modular, enterprise-ready React + TypeScript frontend architecture built around clean separation of concerns, a 3-layer component hierarchy, integration-agnostic service repositories, centralized UI modal hosts, Zustand state management, TanStack Query server caching, and Vitest testing.

---

## 1. Core Architectural Principles

1. **Three-Layer Component System**:
   - **Layer 1 (Primitives):** Base low-level atoms (`Button`, `Input`, `Badge`, `Spinner`, `Card`).
   - **Layer 2 (Composites):** Configured enterprise wrappers (`SearchBox` with debounce, `DataTable` with typed column contracts and skeletons, `ModalHost`).
   - **Layer 3 (Page Composition):** Pages compose building blocks without reinventing plumbing.
2. **Integration-Agnostic Services**:
   - Pages and query hooks depend on abstract contracts (`IItemRepository`, `IAuthRepository`).
   - The underlying transport can be REST, GraphQL, WebSocket, or local mock without changing page components.
3. **Decoupled State Categories**:
   - **Global UI State (Zustand):** Centralized `useModalStore` (`openModal`, `closeModal`), `useUIStore` (light/dark theme, sidebar).
   - **Shared Domain State (Zustand):** `useAuthStore` (persisted session tokens & identity).
   - **Server Cache State (TanStack Query):** Remote collections, query invalidation, and background synchronization.
4. **Centralized Infrastructure Initialization**:
   - Application bootstrap exposes ready-to-use APIs (`AppProviders`, `ModalHost`, `Toaster`, `ErrorBoundary`).
5. **Strict TypeScript & Automated Quality Gates**:
   - Explicit types for component props, API contracts, DTOs, and state slices (`no-explicit-any: error`).
   - Automated testing with Vitest and React Testing Library.

---

## 2. Directory Structure

```text
src/
├── app/                          # Application bootstrap & provider composition
│   ├── App.tsx                   # Root router integration
│   └── providers.tsx             # Theme, QueryClient, ModalHost, Toaster, ErrorBoundary
│
├── components/                   # Three-Layer Reusable Component System
│   ├── primitives/               # Layer 1: Base low-level controls
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── composites/               # Layer 2: High-level configured wrappers
│   │   ├── SearchBox/            # Debounced search with clear trigger & loading state
│   │   ├── DataTable/            # Generic typed table with columns, sorting, empty states
│   │   └── ModalHost/            # Centralized modal host driven by useModalStore
│   ├── ErrorBoundary.tsx         # App-level crash boundary
│   └── index.ts                  # Public export barrel (@/components)
│
├── services/                     # Integration-Agnostic Communication Layer
│   ├── contracts/                # Transport-agnostic repository interfaces
│   │   ├── item.repository.ts    # IItemRepository { list, getById, create, update, delete }
│   │   └── auth.repository.ts    # IAuthRepository { login, register, refresh, getMe }
│   ├── adapters/                 # Concrete transport implementations
│   │   ├── rest/                 # REST implementations over Axios
│   │   │   ├── item.rest.adapter.ts
│   │   │   └── auth.rest.adapter.ts
│   │   └── mock/                 # In-memory mock implementations for offline & testing
│   │       ├── item.mock.adapter.ts
│   │       └── auth.mock.adapter.ts
│   └── index.ts                  # Service container exporting itemService & authService (@/services)
│
├── store/                        # Global Client & UI State Management
│   ├── slices/
│   │   ├── modal.slice.ts        # Centralized modal host state (openModal, closeModal)
│   │   ├── auth.slice.ts         # Persisted session token rotation & current user
│   │   └── ui.slice.ts           # Dark/light mode & responsive sidebar
│   └── index.ts                  # Public store export barrel (@/store)
│
├── features/                     # Layer 3: Feature Pages & Business Logic
│   ├── items/                    # CRUD items catalog
│   │   ├── hooks.ts              # TanStack Query hooks binding itemService
│   │   ├── ItemsPage.tsx         # Feature page composed of SearchBox, DataTable & ModalHost
│   │   ├── ItemDetailPage.tsx    # Single item view (/items/:id)
│   │   ├── schemas.ts            # Zod validation schema
│   │   └── types.ts              # Domain entities and DTOs
│   ├── auth/                     # Authentication views & login mutations
│   └── dashboard/                # Analytics and metric overview
│
├── layouts/                      # Shared layouts (MainLayout, AuthLayout, Navbar, Sidebar)
├── config/                       # Centralized runtime config (env.ts, endpoints.ts)
├── lib/                          # Singletons (queryClient.ts, axios.ts, utils.ts)
├── routes/                       # Data router (createBrowserRouter) with route guards
├── test/                         # Test setup and mocks
└── index.css                     # Tailwind layers & custom scrollbar styles
```

---

## 3. How to Develop a New Feature Page in 30 Seconds

When creating a new feature (e.g. `reports`), developers do **not** configure HTTP clients, modal state, or debouncers. They simply compose the shared foundation:

```tsx
// src/features/reports/ReportsPage.tsx
import React, { useState } from 'react';
import { SearchBox, DataTable, Button } from '@/components';
import { useModalStore } from '@/store';
import { useReportsQuery } from './hooks';

export const ReportsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: reports = [], isLoading } = useReportsQuery({ search });
  const openModal = useModalStore((state) => state.openModal);

  const columns = [
    { key: 'title', header: 'Report Name' },
    { key: 'createdAt', header: 'Generated On' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button onClick={() => openModal('CREATE_REPORT', {})}>Generate Report</Button>
      </div>

      <SearchBox onSearch={setSearch} isLoading={isLoading} />
      <DataTable data={reports} columns={columns} isLoading={isLoading} />
    </div>
  );
};
```

---

## 4. Verification & Testing

The architecture includes a complete Vitest and React Testing Library setup:

```bash
# Run the unit test suite
npm run test

# Run tests in watch mode
npm run test:watch

# Run ESLint validation (0 warnings allowed)
npm run lint

# Run TypeScript compilation
npx tsc --noEmit

# Bundle production build
npm run build
```

### Verified Test Cases
- **Layer 2 Wrapper**: [`SearchBox.test.tsx`](file:///e:/new-architecture/src/components/composites/SearchBox/SearchBox.test.tsx) (verifies debounce delay and clear trigger).
- **Global Modal Host**: [`modal.slice.test.ts`](file:///e:/new-architecture/src/store/slices/modal.slice.test.ts) (verifies modal dispatch, type payload contracts, and reset actions).
- **Integration-Agnostic Adapter**: [`item.mock.adapter.test.ts`](file:///e:/new-architecture/src/services/adapters/mock/item.mock.adapter.test.ts) (verifies repository CRUD operations).

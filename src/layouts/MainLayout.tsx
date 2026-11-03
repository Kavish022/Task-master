import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Spinner } from '@/components/ui/Spinner';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen flex-col bg-surface-light dark:bg-surface-dark transition-colors overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <Suspense
              fallback={
                <div className="flex h-64 items-center justify-center">
                  <Spinner size="lg" variant="primary" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

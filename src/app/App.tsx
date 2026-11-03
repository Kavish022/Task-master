import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { AppProviders } from './providers';
import { LoadingScreen } from '@/components/ui';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} fallbackElement={<LoadingScreen />} />
    </AppProviders>
  );
};

export default App;

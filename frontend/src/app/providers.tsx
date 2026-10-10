import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { ToastProvider } from '../components/feedback/ToastProvider';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
};

import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Spinner } from '../../components/ui/Spinner';

export const PublicOnly: React.FC = () => {
  const { isAuthenticated, isInitialized, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  if (!isInitialized || isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a'
        }}
      >
        <Spinner size={24} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app/stores" replace />;
  }

  return <Outlet />;
};

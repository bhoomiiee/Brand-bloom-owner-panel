import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Spinner } from '../../components/ui/Spinner';

export const RequireAuth: React.FC = () => {
  const { isAuthenticated, isInitialized, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();

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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#94a3b8',
          gap: '12px'
        }}
      >
        <Spinner size={24} />
        <span style={{ fontSize: '14px' }}>Verifying active session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

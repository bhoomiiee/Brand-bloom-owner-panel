import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

export const RequirePermission: React.FC<{ permission: string }> = ({ permission }) => {
  const { hasPermission } = usePermissions();
  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

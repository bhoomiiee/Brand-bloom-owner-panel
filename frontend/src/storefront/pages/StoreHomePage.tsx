import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useCustomerAuthStore } from '../../store/customer-auth.store';

export const StoreHomePage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { isAuthenticated, customer } = useCustomerAuthStore();

  const targetSlug = storeSlug || 'bloom-boutique';

  if (isAuthenticated && customer) {
    return <Navigate to={`/store/${targetSlug}/account`} replace />;
  }

  return <Navigate to={`/store/${targetSlug}/account/login`} replace />;
};

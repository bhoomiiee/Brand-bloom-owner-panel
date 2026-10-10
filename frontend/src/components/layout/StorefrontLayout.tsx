import React from 'react';
import { Outlet } from 'react-router-dom';
import { StoreHeader } from '../../storefront/components/StoreHeader';
import { StoreFooter } from '../../storefront/components/StoreFooter';

export const StorefrontLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff', color: '#111827' }}>
      <StoreHeader />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <StoreFooter />
    </div>
  );
};

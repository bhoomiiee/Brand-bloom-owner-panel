import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useActiveStoreStore } from '../../store/active-store.store';
import { storesApi } from '../../features/stores/api/stores.api';
import { Spinner } from '../../components/ui/Spinner';

export const RequireStore: React.FC = () => {
  const { activeStore, setActiveStore } = useActiveStoreStore();
  const [isResolving, setIsResolving] = useState(!activeStore);
  const [hasNoStores, setHasNoStores] = useState(false);

  useEffect(() => {
    if (activeStore) {
      setIsResolving(false);
      return;
    }

    let isMounted = true;
    storesApi.list()
      .then((stores) => {
        if (!isMounted) return;
        if (stores && stores.length > 0) {
          // Prefer bloom-boutique if available, or previously saved store ID, or the first store
          const savedId = localStorage.getItem('sop_active_store_id');
          const preferred = stores.find(s => s.id === savedId || s._id === savedId) 
            || stores.find(s => s.slug === 'bloom-boutique') 
            || stores[0];

          const storeId = preferred.id || preferred._id || '';
          setActiveStore({
            _id: storeId,
            id: storeId,
            name: preferred.name,
            slug: preferred.slug,
            businessType: preferred.businessType,
            address: preferred.address,
            settings: preferred.settings,
            membership: preferred.membership
          });
        } else {
          setHasNoStores(true);
        }
      })
      .catch(() => {
        if (isMounted) setHasNoStores(true);
      })
      .finally(() => {
        if (isMounted) setIsResolving(false);
      });

    return () => { isMounted = false; };
  }, [activeStore, setActiveStore]);

  if (isResolving) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: '#94a3b8' }}>
        <Spinner size={32} />
        <span style={{ fontSize: '14px' }}>Loading your store dashboard...</span>
      </div>
    );
  }

  if (hasNoStores || !activeStore) {
    return <Navigate to="/app/stores" replace />;
  }

  return <Outlet />;
};


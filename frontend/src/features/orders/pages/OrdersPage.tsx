import React, { useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { OrderTable } from '../components/OrderTable';
import { OrderFilters } from '../components/OrderFilters';
import { useOrders } from '../hooks/useOrders';

export const OrdersPage: React.FC = () => {
  const { orders, isLoading, error } = useOrders();
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o =>
    (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customerEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Customer Orders" subtitle="Track fulfillment lifecycle & order status transitions" />
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div style={{ marginBottom: '20px', maxWidth: '320px' }}>
        <OrderFilters search={search} onSearchChange={setSearch} />
      </div>
      {isLoading ? (
        <div style={{ color: '#94a3b8', padding: '32px', textAlign: 'center' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '48px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
          <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No orders yet</h3>
          <p style={{ color: '#94a3b8' }}>When customers complete checkout on your storefront, orders will appear here.</p>
        </div>
      ) : (
        <OrderTable orders={filtered} />
      )}
    </div>
  );
};

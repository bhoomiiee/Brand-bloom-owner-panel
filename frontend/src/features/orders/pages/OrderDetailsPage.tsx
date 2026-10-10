import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { OrderDetails } from '../components/OrderDetails';
import { OrderStatusControl } from '../components/OrderStatusControl';
import { OrderTimeline } from '../components/OrderTimeline';
import { Button } from '../../../components/ui/Button';
import { ordersApi } from '../api/orders.api';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getById(id);
      setOrder(data.order || data);
      setEvents(data.events || data.timeline || [
        { toStatus: (data.order || data).status, actor: 'System' }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;
    setError(null);
    try {
      await ordersApi.updateStatus(id, newStatus);
      await fetchOrder();
    } catch (err: any) {
      setError(err.message || `Failed to transition order status to ${newStatus}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '720px', padding: '32px', color: '#94a3b8' }}>
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: '720px' }}>
        <PageHeader title="Order Not Found" subtitle="Could not locate the requested order." />
        <Link to="/orders"><Button variant="secondary">Back to Orders</Button></Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <PageHeader
        title={`Order ${order.orderNumber || order._id}`}
        subtitle={`Placed by ${order.customerEmail || 'Guest'}`}
        actions={<Link to="/orders"><Button variant="secondary">Back to Orders</Button></Link>}
      />
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <OrderDetails order={order} />
      <OrderStatusControl currentStatus={order.status} onUpdate={handleUpdateStatus} />
      <OrderTimeline events={events} />
    </div>
  );
};

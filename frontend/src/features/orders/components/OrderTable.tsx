import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../../components/ui/DataTable';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/ui/Button';

export const OrderTable: React.FC<{ orders: any[] }> = ({ orders }) => {
  const columns = [
    { key: 'orderNumber', header: 'Order ID' },
    { key: 'customerEmail', header: 'Customer' },
    { key: 'status', header: 'Status', render: (o: any) => <StatusBadge status={o.status} /> },
    { key: 'totalCents', header: 'Total', render: (o: any) => <PriceDisplay cents={o.totalCents} /> },
    { key: 'actions', header: 'Details', render: (o: any) => (
      <Link to={`/orders/${o._id}`}><Button size="sm" variant="outline">View</Button></Link>
    )}
  ];

  return <DataTable columns={columns} data={orders} />;
};

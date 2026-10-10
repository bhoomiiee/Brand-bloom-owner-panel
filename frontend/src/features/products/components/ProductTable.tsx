import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../../components/ui/DataTable';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/ui/Button';

export const ProductTable: React.FC<{ products: any[]; onDelete: (id: string) => void }> = ({ products, onDelete }) => {
  const columns = [
    { key: 'title', header: 'Product', render: (p: any) => (
      <div>
        <strong style={{ color: '#f8fafc' }}>{p.title}</strong>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.slug}</div>
      </div>
    )},
    { key: 'status', header: 'Status', render: (p: any) => <StatusBadge status={p.status} /> },
    { key: 'basePriceCents', header: 'Price', render: (p: any) => <PriceDisplay cents={p.basePriceCents} /> },
    { key: 'actions', header: 'Actions', render: (p: any) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link to={`/products/${p._id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
        <Button size="sm" variant="danger" onClick={() => onDelete(p._id)}>Archive</Button>
      </div>
    )}
  ];

  return <DataTable columns={columns} data={products} />;
};

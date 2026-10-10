import React from 'react';
import { DataTable } from '../../../components/ui/DataTable';
import { StockBadge } from '../../../components/common/StockBadge';
import { Button } from '../../../components/ui/Button';

export const InventoryTable: React.FC<{ items: any[]; onAdjust: (item: any) => void }> = ({ items, onAdjust }) => {
  const columns = [
    { key: 'sku', header: 'SKU' },
    { key: 'status', header: 'Stock Status', render: (i: any) => <StockBadge onHand={i.onHand} /> },
    { key: 'onHand', header: 'On Hand' },
    { key: 'reserved', header: 'Reserved' },
    { key: 'actions', header: 'Actions', render: (i: any) => (
      <Button size="sm" variant="secondary" onClick={() => onAdjust(i)}>Adjust Stock</Button>
    )}
  ];

  return <DataTable columns={columns} data={items} />;
};

import React from 'react';
import { DataTable } from '../../../components/ui/DataTable';

export const SalesByProduct: React.FC = () => {
  const data = [
    { title: 'Minimalist Linen Shirt', sold: 48, revenue: '₹3,264' },
    { title: 'Japanese Selvedge Denim', sold: 22, revenue: '₹3,190' },
    { title: 'Handmade Wool Beanie', sold: 18, revenue: '₹576' }
  ];

  const columns = [
    { key: 'title', header: 'Product' },
    { key: 'sold', header: 'Units Sold' },
    { key: 'revenue', header: 'Revenue' }
  ];

  return <DataTable columns={columns} data={data} />;
};

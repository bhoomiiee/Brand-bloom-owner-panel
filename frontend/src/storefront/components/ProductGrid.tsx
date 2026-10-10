import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductGrid: React.FC<{ products: any[] }> = ({ products }) => {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '32px 24px', padding: '40px 0'
    }}>
      {products.map(p => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};

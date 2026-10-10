import React from 'react';
import { useParams } from 'react-router-dom';
import { ProductGrid } from '../components/ProductGrid';
import { useStorefront } from '../hooks/useStorefront';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams();
  const { products } = useStorefront();

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 40px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, textTransform: 'capitalize', marginBottom: '8px' }}>
        {categorySlug}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Explore curated selections in {categorySlug}.</p>
      <ProductGrid products={products} />
    </div>
  );
};

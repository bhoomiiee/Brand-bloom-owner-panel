import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ProductTable } from '../components/ProductTable';
import { ProductFilters } from '../components/ProductFilters';
import { Button } from '../../../components/ui/Button';
import { useProducts } from '../hooks/useProducts';

export const ProductsPage: React.FC = () => {
  const { products, isLoading, error, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => (p.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage product pricing, catalog variants & media"
        actions={<Link to="/products/new"><Button>Add Product</Button></Link>}
      />
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div style={{ marginBottom: '20px', maxWidth: '320px' }}>
        <ProductFilters search={search} onSearchChange={setSearch} />
      </div>
      {isLoading ? (
        <div style={{ color: '#94a3b8', padding: '32px', textAlign: 'center' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={{ padding: '48px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
          <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No products found</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Your store catalog is currently empty. Add your first item or import via CSV.</p>
          <Link to="/products/new"><Button>Add Product</Button></Link>
        </div>
      ) : (
        <ProductTable products={filtered} onDelete={deleteProduct} />
      )}
    </div>
  );
};

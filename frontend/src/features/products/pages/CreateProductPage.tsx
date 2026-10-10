import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ProductForm } from '../components/ProductForm';
import { productsApi } from '../api/products.api';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await productsApi.create(data);
      navigate('/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <PageHeader title="New Product" subtitle="Add a new catalog item" />
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

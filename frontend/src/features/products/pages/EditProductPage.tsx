import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ProductForm } from '../components/ProductForm';
import { productsApi } from '../api/products.api';

export const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    productsApi.getById(id)
      .then(data => {
        setProduct(data);
      })
      .catch(err => {
        setError(err.message || 'Failed to load product');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (data: any) => {
    if (!id) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await productsApi.update(id, data);
      navigate('/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ color: '#94a3b8', padding: '24px' }}>Loading product details...</div>;
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <PageHeader title="Edit Product" subtitle="Modify product details & pricing" />
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <ProductForm initialValues={product} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

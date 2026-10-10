import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { CategoryList } from '../components/CategoryList';
import { CategoryForm } from '../components/CategoryForm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { categoriesApi } from '../api/categories.api';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (data: any) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await categoriesApi.create(data);
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => (c._id || c.id) !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organize product catalog taxonomies"
        actions={<Button onClick={() => setIsModalOpen(true)}>Add Category</Button>}
      />
      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      {isLoading ? (
        <div style={{ color: '#94a3b8', padding: '32px', textAlign: 'center' }}>Loading categories...</div>
      ) : categories.length === 0 ? (
        <div style={{ padding: '48px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
          <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No categories created</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Organize your products with custom categories and tags.</p>
          <Button onClick={() => setIsModalOpen(true)}>Add Category</Button>
        </div>
      ) : (
        <CategoryList categories={categories} onDelete={handleDelete} />
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Category">
        <CategoryForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
};

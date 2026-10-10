import React from 'react';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';

export const CategoryList: React.FC<{ categories: any[]; onDelete: (id: string) => void }> = ({ categories, onDelete }) => {
  const columns = [
    { key: 'name', header: 'Category Name' },
    { key: 'slug', header: 'URL Slug' },
    { key: 'actions', header: 'Actions', render: (cat: any) => (
      <Button size="sm" variant="danger" onClick={() => onDelete(cat._id)}>Delete</Button>
    )}
  ];

  return <DataTable columns={columns} data={categories} />;
};

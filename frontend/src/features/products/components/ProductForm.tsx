import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { dollarsToCents } from '../../../utils/money';

export const ProductForm: React.FC<{ initialValues?: any; onSubmit: (data: any) => void; isSubmitting?: boolean }> = ({ initialValues, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [priceDollars, setPriceDollars] = useState(initialValues?.basePriceCents ? (initialValues.basePriceCents / 100).toString() : '49.99');
  const [description, setDescription] = useState(initialValues?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      basePriceCents: Math.round(parseFloat(priceDollars) * 100)
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Input label="Product Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Input label="Price (INR ₹)" type="number" step="0.01" value={priceDollars} onChange={e => setPriceDollars(e.target.value)} required />
      <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving Product...' : 'Save Product'}
      </Button>
    </form>
  );
};

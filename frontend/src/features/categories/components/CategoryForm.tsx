import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const CategoryForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name, description }); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
      <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <Button type="submit">Create Category</Button>
    </form>
  );
};

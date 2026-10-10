import React from 'react';
import { Select } from '../../../components/ui/Select';

export const CategoryPicker: React.FC<{ categories: any[]; value?: string; onChange: (id: string) => void }> = ({
  categories, value, onChange
}) => {
  return (
    <Select label="Category" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select category...</option>
      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
    </Select>
  );
};

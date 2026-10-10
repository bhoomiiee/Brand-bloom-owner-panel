import React from 'react';
import { Input } from '../ui/Input';

export const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  value, onChange, placeholder = 'Search...'
}) => {
  return <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
};

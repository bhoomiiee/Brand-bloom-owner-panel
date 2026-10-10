import React from 'react';
import { Select } from './Select';

export const DateRangePicker: React.FC<{ onChange?: (range: string) => void }> = ({ onChange }) => {
  return (
    <Select onChange={e => onChange?.(e.target.value)} defaultValue="30d">
      <option value="today">Today</option>
      <option value="7d">Last 7 Days</option>
      <option value="30d">Last 30 Days</option>
      <option value="90d">Last 90 Days</option>
    </Select>
  );
};

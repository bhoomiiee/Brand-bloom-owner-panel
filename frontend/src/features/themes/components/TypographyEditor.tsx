import React from 'react';
import { Select } from '../../../components/ui/Select';

export const TypographyEditor: React.FC = () => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <Select label="Primary Font">
        <option value="Inter">Plus Jakarta Sans</option>
        <option value="Playfair">Playfair Display (Serif)</option>
        <option value="Space">Space Grotesk</option>
      </Select>
    </div>
  );
};

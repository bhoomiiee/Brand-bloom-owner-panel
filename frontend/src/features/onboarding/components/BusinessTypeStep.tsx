import React from 'react';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

export const BusinessTypeStep: React.FC<{ data: any; onChange: (d: any) => void; onNext: () => void; onPrev: () => void }> = ({ data, onChange, onNext, onPrev }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3>Step 3: Business Type</h3>
      <Select label="Category" value={data.businessType} onChange={e => onChange({ ...data, businessType: e.target.value })}>
        <option value="Retail">Retail & Apparel</option>
        <option value="Electronics">Electronics</option>
        <option value="Home">Home & Living</option>
      </Select>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onPrev}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
};

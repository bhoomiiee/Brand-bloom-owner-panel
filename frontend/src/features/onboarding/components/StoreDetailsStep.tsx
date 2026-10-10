import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const StoreDetailsStep: React.FC<{ data: any; onChange: (d: any) => void; onNext: () => void }> = ({ data, onChange, onNext }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3>Step 1: Store Basics</h3>
      <Input label="Store Name" value={data.storeName} onChange={e => onChange({ ...data, storeName: e.target.value })} required />
      <Button onClick={onNext}>Continue</Button>
    </div>
  );
};

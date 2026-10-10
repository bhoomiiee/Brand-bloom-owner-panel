import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const AddressStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3>Step 4: Business Address</h3>
      <Input label="Street" placeholder="123 Commerce Way" />
      <Input label="City" placeholder="New York" />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onPrev}>Back</Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
};

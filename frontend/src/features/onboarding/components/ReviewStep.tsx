import React from 'react';
import { Button } from '../../../components/ui/Button';

export const ReviewStep: React.FC<{ data: any; onComplete: () => void; onPrev: () => void; isSubmitting?: boolean }> = ({ data, onComplete, onPrev, isSubmitting }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3>Step 5: Review & Launch</h3>
      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', fontSize: '14px' }}>
        <p><strong>Store Name:</strong> {data.storeName}</p>
        <p><strong>Type:</strong> {data.businessType}</p>
        <p><strong>Currency:</strong> {data.currency}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={onPrev} disabled={isSubmitting}>Back</Button>
        <Button onClick={onComplete} disabled={isSubmitting}>
          {isSubmitting ? 'Launching Store...' : 'Launch Store Portal 🚀'}
        </Button>
      </div>
    </div>
  );
};

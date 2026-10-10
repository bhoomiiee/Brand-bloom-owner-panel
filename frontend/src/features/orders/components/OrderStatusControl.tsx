import React from 'react';
import { Button } from '../../../components/ui/Button';

export const OrderStatusControl: React.FC<{ currentStatus: string; onUpdate: (s: string) => void }> = ({
  currentStatus, onUpdate
}) => {
  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      {currentStatus === 'PAID' && <Button size="sm" onClick={() => onUpdate('PROCESSING')}>Mark Processing</Button>}
      {currentStatus === 'PROCESSING' && <Button size="sm" onClick={() => onUpdate('FULFILLED')}>Mark Fulfilled</Button>}
      {['PAID', 'PROCESSING'].includes(currentStatus) && <Button size="sm" variant="danger" onClick={() => onUpdate('CANCELLED')}>Cancel Order</Button>}
    </div>
  );
};

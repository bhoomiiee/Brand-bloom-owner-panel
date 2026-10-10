import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const StockAdjustmentForm: React.FC<{ item: any; onSubmit: (delta: number, reason: string) => void }> = ({
  item, onSubmit
}) => {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('Restock shipment');

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(delta, reason); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ fontSize: '14px', color: '#94a3b8' }}>Adjusting stock for <strong>{item?.sku}</strong> (Current: {item?.onHand})</p>
      <Input label="Adjustment (+/- Quantity)" type="number" value={delta} onChange={e => setDelta(parseInt(e.target.value, 10))} required />
      <Input label="Reason" value={reason} onChange={e => setReason(e.target.value)} required />
      <Button type="submit">Submit Adjustment</Button>
    </form>
  );
};

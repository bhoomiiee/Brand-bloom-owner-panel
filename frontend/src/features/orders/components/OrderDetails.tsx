import React from 'react';
import { PriceDisplay } from '../../../components/common/PriceDisplay';

export const OrderDetails: React.FC<{ order: any }> = ({ order }) => {
  return (
    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
      <h3 style={{ marginBottom: '16px' }}>Order Items</h3>
      {order?.items?.map((item: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155' }}>
          <span>{item.title} x {item.quantity}</span>
          <PriceDisplay cents={item.priceCents * item.quantity} />
        </div>
      ))}
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
        <span>Total</span>
        <PriceDisplay cents={order?.totalCents || 0} />
      </div>
    </div>
  );
};

import React from 'react';
import { formatCurrency } from '../../../utils/currency';
import { BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const RecentActivity: React.FC<{ orders?: any[] }> = ({ orders = [] }) => {
  return (
    <div
      className="bb-card"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <BotanicalCardAccent position="top-right" size={60} opacity={0.25} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '16px' }}>🧾</span>
        <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--bb-burgundy)', margin: 0 }}>
          Recent Order Activity Log
        </h4>
      </div>
      {orders.length === 0 ? (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            background: 'var(--bb-warm-offwhite)',
            borderRadius: '10px',
            border: '1px dashed var(--bb-border)',
            color: 'var(--bb-muted-text)',
            fontSize: '13.5px'
          }}
        >
          No recent order activity recorded in this store yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map((order, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13.5px',
                borderBottom: idx === orders.length - 1 ? 'none' : '1px solid var(--bb-border-subtle)',
                paddingBottom: '10px'
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: 'var(--bb-dark-text)' }}>{order.orderNumber}</span>
                <span style={{ color: 'var(--bb-muted-text)', marginLeft: '8px', fontSize: '12.5px' }}>
                  {order.customerEmail}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, color: 'var(--bb-burgundy)' }}>
                  {formatCurrency(order.totalCents)}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'var(--bb-soft-blush)',
                    color: 'var(--bb-burgundy)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

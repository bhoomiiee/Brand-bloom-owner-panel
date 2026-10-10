import React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const LowStockWidget: React.FC<{ count: number }> = ({ count }) => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--bb-burgundy)' }}>
            Low Stock Alerts
          </h4>
        </div>
        <Badge variant={count > 0 ? 'warning' : 'success'}>
          {count} {count === 1 ? 'alert' : 'alerts'}
        </Badge>
      </div>
      <p style={{ fontSize: '13.5px', color: 'var(--bb-muted-text)', marginTop: '10px', lineHeight: 1.5 }}>
        {count > 0
          ? 'Some catalog items have reached safety stock reorder thresholds.'
          : 'All catalog items and variants are well-stocked.'}
      </p>
    </div>
  );
};

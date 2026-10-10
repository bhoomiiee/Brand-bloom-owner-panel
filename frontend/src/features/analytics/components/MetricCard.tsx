import React from 'react';

export const MetricCard: React.FC<{ label: string; value: string | number; change?: string }> = ({ label, value, change }) => {
  return (
    <div className="bb-card" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--bb-burgundy)', marginTop: '8px', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: '12px', color: 'var(--bb-dusty-rose)', fontWeight: 600, marginTop: '6px' }}>
          {change}
        </div>
      )}
    </div>
  );
};

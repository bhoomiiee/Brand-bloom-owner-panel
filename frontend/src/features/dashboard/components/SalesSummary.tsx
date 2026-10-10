import React from 'react';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const SalesSummary: React.FC<{ revenueCents: number; orderCount: number; aovCents: number }> = ({
  revenueCents,
  orderCount,
  aovCents
}) => {
  const cards = [
    { label: 'Total Revenue', value: <PriceDisplay cents={revenueCents} />, accent: 'var(--bb-burgundy)', icon: '🌸' },
    { label: 'Paid Orders', value: orderCount, accent: 'var(--bb-dusty-rose)', icon: '🛍️' },
    { label: 'Avg Order Value', value: <PriceDisplay cents={aovCents} />, accent: 'var(--bb-burgundy)', icon: '✨' }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          className="bb-card"
          style={{
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Botanical leaf accent on the main Revenue card */}
          {i === 0 && <BotanicalCardAccent position="top-right" size={68} opacity={0.6} />}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-muted-text)' }}>
              {c.label}
            </span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--bb-soft-blush)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              {c.icon}
            </span>
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: c.accent,
              marginTop: '12px',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {c.value}
          </div>

          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--accent-success)',
                fontWeight: 600,
                background: 'var(--accent-success-bg)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              Live
            </span>
            <span style={{ fontSize: '12px', color: 'var(--bb-muted-text)' }}>Verified store data</span>
          </div>
        </div>
      ))}
    </div>
  );
};

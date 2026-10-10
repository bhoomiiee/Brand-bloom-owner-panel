import React from 'react';

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}> = ({
  title,
  subtitle,
  actions,
  badge
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--bb-burgundy)',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-sans)'
            }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--bb-muted-text)',
              marginTop: '5px',
              lineHeight: 1.5
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

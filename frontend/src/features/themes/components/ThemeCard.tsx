import React from 'react';

export const ThemeCard: React.FC<{ theme: any; isSelected: boolean; onSelect: () => void }> = ({
  theme, isSelected, onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '16px',
        borderRadius: '10px',
        cursor: 'pointer',
        border: isSelected ? '2px solid var(--bb-burgundy)' : '1px solid var(--bb-border)',
        background: isSelected ? 'var(--bb-soft-blush)' : 'var(--bb-white)',
        boxShadow: isSelected ? '0 2px 8px rgba(99, 45, 64, 0.12)' : 'none',
        transition: 'all 0.15s ease'
      }}
    >
      <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: isSelected ? 'var(--bb-burgundy)' : 'var(--bb-dark-text)' }}>
        {theme.name}
      </h4>
      <p style={{ fontSize: '12px', color: 'var(--bb-muted-text)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
        {theme.desc}
      </p>
    </div>
  );
};

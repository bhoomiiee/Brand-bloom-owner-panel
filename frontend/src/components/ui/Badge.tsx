import React from 'react';

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  style?: React.CSSProperties;
}> = ({
  children,
  variant = 'info',
  style
}) => {
  const colors = {
    success: { bg: 'var(--accent-success-bg)', text: 'var(--accent-success)', border: 'rgba(46, 125, 71, 0.25)' },
    warning: { bg: 'var(--accent-warning-bg)', text: 'var(--accent-warning)', border: 'rgba(180, 108, 24, 0.25)' },
    danger: { bg: 'var(--accent-danger-bg)', text: 'var(--accent-danger)', border: 'rgba(166, 46, 64, 0.25)' },
    info: { bg: 'var(--bb-soft-blush)', text: 'var(--bb-burgundy)', border: 'rgba(189, 124, 145, 0.35)' }
  }[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '11.5px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 2px rgba(61, 32, 43, 0.03)',
        ...style
      }}
    >
      {children}
    </span>
  );
};

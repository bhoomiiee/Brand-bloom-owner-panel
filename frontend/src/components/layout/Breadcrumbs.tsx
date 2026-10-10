import React from 'react';

export const Breadcrumbs: React.FC<{ items: Array<{ label: string; href?: string }> }> = ({ items }) => {
  return (
    <nav style={{ display: 'flex', gap: '6px', fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
      {items.map((it, idx) => (
        <span key={idx}>
          {it.href ? <a href={it.href}>{it.label}</a> : it.label}
          {idx < items.length - 1 && ' / '}
        </span>
      ))}
    </nav>
  );
};

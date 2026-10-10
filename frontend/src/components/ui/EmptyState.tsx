import React from 'react';

export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({
  title, description, action
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>{title}</h4>
      <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>{description}</p>
      {action}
    </div>
  );
};

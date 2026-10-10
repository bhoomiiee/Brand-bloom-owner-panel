import React from 'react';

export const CustomerSummary: React.FC<{ email: string }> = ({ email }) => {
  return <div style={{ fontSize: '14px', color: '#94a3b8' }}>Customer: <strong style={{ color: '#fff' }}>{email}</strong></div>;
};

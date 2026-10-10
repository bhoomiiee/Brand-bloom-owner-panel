import React from 'react';

export const FormError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>{message}</div>;
};

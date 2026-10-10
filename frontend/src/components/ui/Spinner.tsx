import React from 'react';

export const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return (
    <div style={{
      width: size, height: size, border: '2px solid rgba(255,255,255,0.2)',
      borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
    }} />
  );
};

import React from 'react';

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
      <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#6366f1' }} {...props} />
      {label}
    </label>
  );
};

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-muted-text)' }}>
          {label}
        </label>
      )}
      <input
        style={{
          padding: '10px 14px',
          background: 'var(--bb-white)',
          border: error ? '1.5px solid var(--accent-danger)' : '1px solid var(--bb-border)',
          borderRadius: '10px',
          color: 'var(--bb-dark-text)',
          outline: 'none',
          fontSize: '14px',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: 'inset 0 1px 2px rgba(61, 32, 43, 0.03)',
          ...style
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-danger)' }}>{error}</span>}
    </div>
  );
};

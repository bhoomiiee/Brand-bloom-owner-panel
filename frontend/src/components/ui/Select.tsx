import React from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, children, style, ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bb-muted-text)' }}>{label}</label>}
      <select
        style={{
          padding: '10px 14px',
          background: 'var(--bb-white)',
          border: error ? '1.5px solid var(--accent-danger)' : '1px solid var(--bb-border)',
          borderRadius: '10px',
          color: 'var(--bb-dark-text)',
          outline: 'none',
          fontSize: '14px',
          boxShadow: 'inset 0 1px 2px rgba(61, 32, 43, 0.03)',
          ...style
        }}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-danger)' }}>{error}</span>}
    </div>
  );
};

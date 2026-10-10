import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--bb-burgundy)',
          color: 'var(--bb-white)',
          border: '1px solid var(--bb-burgundy-dark)',
          boxShadow: '0 2px 6px rgba(99, 45, 64, 0.2)'
        };
      case 'secondary':
        return {
          background: 'var(--bb-dusty-rose)',
          color: 'var(--bb-white)',
          border: '1px solid var(--bb-dusty-rose-dark)',
          boxShadow: '0 2px 4px rgba(189, 124, 145, 0.15)'
        };
      case 'outline':
        return {
          background: 'var(--bb-white)',
          color: 'var(--bb-burgundy)',
          border: '1px solid var(--bb-border)',
          boxShadow: '0 1px 2px rgba(61, 32, 43, 0.04)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--bb-burgundy)',
          border: 'none'
        };
      case 'danger':
        return {
          background: 'var(--accent-danger)',
          color: 'var(--bb-white)',
          border: '1px solid #7F222F',
          boxShadow: '0 2px 6px rgba(166, 46, 64, 0.2)'
        };
      default:
        return {};
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: '10px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all 0.15s ease',
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '9px 18px',
    fontSize: size === 'sm' ? '13px' : size === 'lg' ? '15.5px' : '14px',
    letterSpacing: '-0.01em',
    ...getVariantStyles(),
    ...style
  };

  return (
    <button style={baseStyle} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

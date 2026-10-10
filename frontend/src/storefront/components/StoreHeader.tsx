import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCustomerAuthStore } from '../../store/customer-auth.store';

export const StoreHeader: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useCustomerAuthStore();

  const handleLogout = () => {
    logout();
    navigate(`/store/${storeSlug}/account/login`);
  };

  const storeDisplayName = storeSlug
    ? storeSlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Store';

  return (
    <header
      style={{
        padding: '16px 36px',
        borderBottom: '1px solid var(--bb-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'var(--bb-white)',
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(99, 45, 64, 0.04)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link
          to={`/store/${storeSlug}/account`}
          style={{
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: 'var(--bb-burgundy)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🌸</span> {storeDisplayName}
        </Link>
        <span
          style={{
            background: 'var(--bb-soft-blush)',
            color: 'var(--bb-burgundy)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Customer Portal
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated && customer ? (
          <>
            <Link
              to={`/store/${storeSlug}/account`}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--bb-dark-text)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>👤</span>
              <span>{[customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email}</span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                background: 'var(--bb-warm-offwhite)',
                color: '#b91c1c',
                border: '1px solid var(--bb-border)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to={`/store/${storeSlug}/account/login`}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--bb-burgundy)',
                textDecoration: 'none',
                padding: '8px 14px'
              }}
            >
              Sign In
            </Link>
            <Link
              to={`/store/${storeSlug}/account/register`}
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--bb-white)',
                background: 'var(--bb-burgundy)',
                padding: '9px 18px',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(99, 45, 64, 0.2)'
              }}
            >
              Create Account
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

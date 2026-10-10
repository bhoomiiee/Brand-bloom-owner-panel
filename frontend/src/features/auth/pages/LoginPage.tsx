import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { BotanicalCornerFoliage, BotanicalCardAccent, BotanicalLogoMark } from '../../../components/botanical/BotanicalDecorations';

export const LoginPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bb-warm-offwhite)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <BotanicalCornerFoliage position="top-right" size={260} opacity={0.35} />
      <BotanicalCornerFoliage position="bottom-left" size={240} opacity={0.3} />

      <div
        className="bb-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '40px 36px',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 16px 40px -8px rgba(99, 45, 64, 0.12)'
        }}
      >
        <BotanicalCardAccent position="top-right" size={80} opacity={0.35} />

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '12px' }}>
            <BotanicalLogoMark size={44} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--bb-burgundy)', letterSpacing: '-0.02em' }}>
            Merchant Login
          </h1>
          <p style={{ color: 'var(--bb-muted-text)', fontSize: '14px', margin: 0 }}>
            Manage your BrandBloom storefront &amp; customer CRM
          </p>
        </div>

        <LoginForm />

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13.5px', color: 'var(--bb-muted-text)' }}>
          Don't have a store?{' '}
          <Link to="/register" style={{ color: 'var(--bb-burgundy)', fontWeight: 700, textDecoration: 'none' }}>
            Create one →
          </Link>
        </div>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '18px',
            borderTop: '1px solid var(--bb-border)',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--bb-muted-text)'
          }}
        >
          Shopping as a customer?{' '}
          <Link to="/store/bloom-boutique" style={{ color: 'var(--bb-dusty-rose)', fontWeight: 700, textDecoration: 'none' }}>
            Open Consumer Storefront ↗
          </Link>
        </div>
      </div>
    </div>
  );
};

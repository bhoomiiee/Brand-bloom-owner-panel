import React from 'react';
import { Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { BotanicalCornerFoliage, BotanicalCardAccent, BotanicalLogoMark } from '../../../components/botanical/BotanicalDecorations';

export const ForgotPasswordPage: React.FC = () => {
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
      <BotanicalCornerFoliage position="top-right" size={240} opacity={0.3} />

      <div
        className="bb-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px',
          position: 'relative',
          zIndex: 1
        }}
      >
        <BotanicalCardAccent position="top-right" size={70} opacity={0.3} />
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '8px' }}>
            <BotanicalLogoMark size={40} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--bb-burgundy)', margin: '0 0 6px 0' }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--bb-muted-text)', fontSize: '13.5px', margin: 0 }}>
            Enter your email to receive recovery instructions
          </p>
        </div>

        <ForgotPasswordForm />

        <Link
          to="/login"
          style={{
            display: 'block',
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--bb-burgundy)',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          ← Back to login
        </Link>
      </div>
    </div>
  );
};

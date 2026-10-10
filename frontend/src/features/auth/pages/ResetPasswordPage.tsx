import React from 'react';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', background: '#1e293b', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Set New Password</h2>
        <ResetPasswordForm />
      </div>
    </div>
  );
};

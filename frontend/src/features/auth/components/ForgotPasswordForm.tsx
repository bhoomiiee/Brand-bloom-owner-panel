import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { authApi } from '../api/auth.api';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authApi.forgotPassword(email);
    setSent(true);
  };

  if (sent) return <p style={{ color: '#10b981', textAlign: 'center' }}>Password reset link sent to your email.</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Button type="submit">Send Reset Link</Button>
    </form>
  );
};

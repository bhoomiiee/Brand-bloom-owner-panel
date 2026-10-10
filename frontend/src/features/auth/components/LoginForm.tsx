import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}
      <Button type="submit" isLoading={isLoading} style={{ marginTop: '8px' }}>Sign In</Button>
    </form>
  );
};

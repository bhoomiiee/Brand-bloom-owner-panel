import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export const RegisterForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ firstName, lastName, email, password });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Input label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <Input label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
      </div>
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}
      <Button type="submit" isLoading={isLoading} style={{ marginTop: '8px' }}>Create Account</Button>
    </form>
  );
};

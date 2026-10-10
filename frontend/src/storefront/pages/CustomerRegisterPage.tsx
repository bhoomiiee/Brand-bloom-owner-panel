import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { customerApi } from '../api/customer.api';
import { useCustomerAuthStore } from '../../store/customer-auth.store';

export const CustomerRegisterPage: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { setAuth } = useCustomerAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await customerApi.register(storeSlug, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword
      });
      setAuth(res.customer, res.token);
      navigate(`/store/${storeSlug}/account`);
    } catch (err: any) {
      setError(err.message || 'Failed to create customer account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '48px auto', padding: '0 20px', position: 'relative' }}>
      <div
        className="bb-card"
        style={{
          background: 'var(--bb-white)',
          padding: '36px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 32px -6px rgba(99, 45, 64, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--bb-soft-blush)',
              color: 'var(--bb-burgundy)',
              fontSize: '22px',
              marginBottom: '12px'
            }}
          >
            🌸
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--bb-burgundy)' }}>
            Create Customer Account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--bb-muted-text)', margin: 0 }}>
            Register to access your personal customer portal
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--bb-dark-text)', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="e.g. Jane Doe"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--bb-border)',
                background: 'var(--bb-white)',
                color: 'var(--bb-dark-text)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--bb-dark-text)', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--bb-border)',
                background: 'var(--bb-white)',
                color: 'var(--bb-dark-text)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--bb-dark-text)', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--bb-border)',
                background: 'var(--bb-white)',
                color: 'var(--bb-dark-text)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--bb-dark-text)', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Re-enter password"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--bb-border)',
                background: 'var(--bb-white)',
                color: 'var(--bb-dark-text)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              background: 'var(--bb-burgundy)',
              color: 'var(--bb-white)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'background 0.2s',
              boxShadow: '0 2px 6px rgba(99, 45, 64, 0.2)'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--bb-muted-text)' }}>
          Already have an account?{' '}
          <Link
            to={`/store/${storeSlug}/account/login`}
            style={{ color: 'var(--bb-burgundy)', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

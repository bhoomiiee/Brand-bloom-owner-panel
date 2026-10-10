import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useActiveStoreStore } from '../../store/active-store.store';
import { Button } from '../ui/Button';
import { BotanicalHeaderLeaves } from '../botanical/BotanicalDecorations';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { activeStore } = useActiveStoreStore();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    if (!user?.email) return;
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/v1/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: user.email })
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus(`✓ Sent to ${user.email}`);
      } else {
        setEmailStatus(`Error: ${data.error || 'Failed'}`);
      }
    } catch {
      setEmailStatus('Network error');
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailStatus(null), 5000);
    }
  };

  return (
    <header
      style={{
        height: '68px',
        background: 'var(--bb-white)',
        borderBottom: '1px solid var(--bb-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 2px 10px rgba(99, 45, 64, 0.03)'
      }}
    >
      {/* Left: Active store info & quick links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--bb-burgundy)' }}>
            {activeStore?.name || 'Active Store'}
          </span>
          <span
            style={{
              fontSize: '11px',
              background: 'var(--bb-soft-blush)',
              color: 'var(--bb-burgundy)',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 700,
              letterSpacing: '0.03em'
            }}
          >
            {activeStore?.membership?.role?.toUpperCase() || 'OWNER'}
          </span>
        </div>

        <Link
          to="/app/stores"
          style={{
            fontSize: '12.5px',
            color: 'var(--bb-muted-text)',
            background: 'var(--bb-warm-offwhite)',
            padding: '5px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            border: '1px solid var(--bb-border)',
            fontWeight: 500,
            transition: 'all 0.15s ease'
          }}
          title="Switch to another store"
        >
          ⇄ Switch Store
        </Link>

        <Link
          to="/customers"
          style={{
            fontSize: '12.5px',
            color: 'var(--bb-burgundy)',
            background: 'var(--bb-soft-blush-light)',
            padding: '5px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            border: '1px solid var(--bb-soft-blush)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span>👥</span>
          <span>Customers CRM</span>
        </Link>
      </div>

      {/* Right: Botanical leaves, notifications, test email, user profile, and sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Decorative botanical foliage in top-right header area */}
        <BotanicalHeaderLeaves />

        <NotificationBell />

        {emailStatus && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: emailStatus.startsWith('✓') ? 'var(--accent-success)' : 'var(--accent-danger)'
            }}
          >
            {emailStatus}
          </span>
        )}

        <button
          onClick={handleSendTestEmail}
          disabled={isSendingEmail}
          style={{
            padding: '6px 12px',
            background: 'var(--bb-white)',
            border: '1px solid var(--bb-dusty-rose)',
            borderRadius: '8px',
            color: 'var(--bb-burgundy)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: isSendingEmail ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 3px rgba(99, 45, 64, 0.05)'
          }}
          title="Send real test email via Resend to your signed-in email"
        >
          <span>✉️</span>
          <span>{isSendingEmail ? 'Sending...' : 'Test Resend Email'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bb-soft-blush)',
              color: 'var(--bb-burgundy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            {(user?.name || user?.email || 'A')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', color: 'var(--bb-muted-text)' }}>
            <strong style={{ color: 'var(--bb-dark-text)' }}>{user?.email}</strong>
          </span>
        </div>

        <Button size="sm" variant="outline" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { emailApi, EmailStatusResponse, SendTestEmailResponse } from '../api/email.api';
import { useAuthStore } from '../../../store/auth.store';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';

export const EmailSettingsCard: React.FC = () => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<EmailStatusResponse | null>(null);
  const [recipient, setRecipient] = useState<string>(user?.email || 'aishwarya.pro369@gmail.com');
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<SendTestEmailResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await emailApi.getStatus();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || isSending) return;

    setIsSending(true);
    setSuccessResult(null);
    setErrorMessage(null);

    try {
      const result = await emailApi.sendTestEmail(recipient.trim().toLowerCase());
      setSuccessResult(result);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to dispatch test email. Please verify RESEND_API_KEY and check whether the recipient is verified in your Resend dashboard.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="bb-card"
      style={{
        padding: '28px 32px',
        marginTop: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--bb-burgundy)' }}>
            Email Delivery &amp; Verification (Resend)
          </h2>
          <p style={{ color: 'var(--bb-muted-text)', fontSize: '13px', margin: '4px 0 0 0' }}>
            Powered by Resend. Delivers staff invitations, customer order receipts, password resets, and marketing campaigns.
          </p>
        </div>
        <div>
          {isLoadingStatus ? (
            <Badge variant="info">Checking...</Badge>
          ) : status?.isConfigured ? (
            <Badge variant="success">Resend Connected</Badge>
          ) : (
            <Badge variant="danger">Not Configured</Badge>
          )}
        </div>
      </div>

      {/* Provider Details Bar */}
      <div
        style={{
          background: 'var(--bb-warm-offwhite)',
          borderRadius: '10px',
          border: '1px solid var(--bb-border)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          fontSize: '13px'
        }}
      >
        <div>
          <span style={{ color: 'var(--bb-muted-text)', display: 'block', fontSize: '12px' }}>Active Provider:</span>
          <strong style={{ color: 'var(--bb-burgundy)', textTransform: 'uppercase', fontWeight: 700 }}>
            {status?.provider || 'Resend'}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--bb-muted-text)', display: 'block', fontSize: '12px' }}>Sender Address:</span>
          <code style={{ color: 'var(--bb-burgundy)', background: 'var(--bb-soft-blush)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
            {status?.from || 'onboarding@resend.dev'}
          </code>
        </div>
        <div>
          <span style={{ color: 'var(--bb-muted-text)', display: 'block', fontSize: '12px' }}>API Key Status:</span>
          <span style={{ color: status?.isConfigured ? '#166534' : '#b91c1c', fontWeight: 600 }}>
            {status?.isConfigured ? '✓ Configured in backend/.env' : '⚠️ Missing RESEND_API_KEY'}
          </span>
        </div>
      </div>

      {/* Test Email Form */}
      <form onSubmit={handleSendTestEmail}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', maxWidth: '640px' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Recipient Email Address"
              placeholder="name@example.com"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          <Button type="submit" isLoading={isSending} disabled={isSending || !recipient.trim()}>
            Send Test Email
          </Button>
        </div>
      </form>

      {/* Success Banner */}
      {successResult && (
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid #22c55e',
            borderRadius: '10px',
            padding: '16px 20px',
            color: '#166534',
            fontSize: '14px',
            lineHeight: 1.5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <strong style={{ color: '#166534', fontSize: '15px' }}>
              Real Test Email Dispatched Successfully!
            </strong>
          </div>
          <p style={{ margin: '0 0 6px 0', color: 'var(--bb-dark-text)' }}>
            {successResult.message}
          </p>
          {successResult.messageId && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--bb-muted-text)' }}>
              Provider Message ID:{' '}
              <code style={{ color: 'var(--bb-burgundy)', background: 'var(--bb-soft-blush)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {successResult.messageId}
              </code>
            </p>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            marginTop: '20px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            padding: '16px 20px',
            color: '#991b1b',
            fontSize: '14px',
            lineHeight: 1.5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>❌</span>
            <strong style={{ color: '#b91c1c', fontSize: '15px' }}>Email Delivery Failed</strong>
          </div>
          <p style={{ margin: '0 0 8px 0', color: '#991b1b' }}>{errorMessage}</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--bb-muted-text)' }}>
            <strong>Troubleshooting Tip:</strong> When using the default sender <code>onboarding@resend.dev</code> in testing mode, Resend permits sending to the account owner's email address (such as <code>aishwarya.pro369@gmail.com</code>). To send to custom domains or other users, verify your domain in the Resend dashboard.
          </p>
        </div>
      )}
    </div>
  );
};

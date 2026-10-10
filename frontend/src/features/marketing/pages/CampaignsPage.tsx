import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { marketingApi, Campaign } from '../api/marketing.api';
import { formatCurrency } from '../../../utils/currency';

export const CampaignsPage: React.FC = () => {
  const { activeStore } = useActiveStoreStore();
  const storeId = activeStore?.id;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test Email State
  const [testModalCampaign, setTestModalCampaign] = useState<Campaign | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  // Send Live Campaign State
  const [isSendingLive, setIsSendingLive] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await marketingApi.listCampaigns(storeId);
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !testModalCampaign || !testEmail.trim()) return;

    setIsSendingTest(true);
    setTestFeedback(null);
    try {
      const res = await marketingApi.sendTestEmail(storeId, testModalCampaign.id, testEmail.trim());
      setTestFeedback(res.message || 'Test email dispatched successfully!');
      setTimeout(() => {
        setTestModalCampaign(null);
        setTestFeedback(null);
      }, 1500);
    } catch (err: any) {
      setTestFeedback(`Test send failed: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendLive = async (c: Campaign) => {
    if (!storeId) return;
    if (!window.confirm(`Are you sure you want to dispatch campaign "${c.name}" to all opted-in customers in segment "${c.targetSegment}"?`)) {
      return;
    }

    setIsSendingLive(true);
    try {
      const res = await marketingApi.sendCampaign(storeId, c.id);
      alert(res.message || 'Campaign launched!');
      fetchCampaigns();
    } catch (err: any) {
      alert(`Campaign send error: ${err.message}`);
    } finally {
      setIsSendingLive(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: '#064e3b', color: '#34d399', fontWeight: 600 }}>Completed</span>;
      case 'SENDING':
        return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: '#1e3a8a', color: '#60a5fa', fontWeight: 600 }}>Sending</span>;
      case 'SCHEDULED':
        return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: '#312e81', color: '#a5b4fc', fontWeight: 600 }}>Scheduled</span>;
      case 'FAILED':
        return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: '#7f1d1d', color: '#fca5a5', fontWeight: 600 }}>Failed</span>;
      case 'DRAFT':
      default:
        return <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: '#334155', color: '#94a3b8', fontWeight: 600 }}>Draft</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <PageHeader
          title="Email Marketing Campaigns"
          subtitle="Design, segment, and dispatch targeted marketing campaigns with live conversion attribution"
        />
        <Link
          to="/campaigns/new"
          style={{
            padding: '10px 18px',
            background: '#6366f1',
            color: '#ffffff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          + Create New Campaign
        </Link>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#94a3b8', padding: '48px', textAlign: 'center' }}>Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div style={{ padding: '48px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
          <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No marketing campaigns yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
            Reach out to your opted-in subscribers with announcements, seasonal sales, and coupon codes.
          </p>
          <Link
            to="/campaigns/new"
            style={{
              padding: '10px 18px',
              background: '#6366f1',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '14px 16px' }}>Campaign Name</th>
                <th style={{ padding: '14px 16px' }}>Target Segment</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Emails Sent</th>
                <th style={{ padding: '14px 16px' }}>Attributed Orders</th>
                <th style={{ padding: '14px 16px' }}>Attributed Revenue</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{c.subject}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#cbd5e1' }}>
                    {c.targetSegment.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>{getStatusBadge(c.status)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {c.metrics?.sentCount || 0}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f8fafc' }}>
                    {c.metrics?.attributedOrdersCount || 0}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#10b981' }}>
                    {formatCurrency(c.metrics?.attributedRevenueCents || 0)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setTestModalCampaign(c);
                          setTestFeedback(null);
                        }}
                        style={{
                          padding: '6px 10px',
                          background: '#334155',
                          color: '#e2e8f0',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Send Test
                      </button>

                      {c.status === 'DRAFT' && (
                        <button
                          disabled={isSendingLive}
                          onClick={() => handleSendLive(c)}
                          style={{
                            padding: '6px 12px',
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isSendingLive ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Send Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Test Email Modal */}
      {testModalCampaign && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '90%',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px',
              color: '#f8fafc'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Send Test Preview Email</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Preview how "{testModalCampaign.name}" renders directly in your inbox.
            </p>

            {testFeedback && (
              <div
                style={{
                  marginBottom: '14px',
                  padding: '10px',
                  background: testFeedback.includes('failed') ? '#7f1d1d' : '#064e3b',
                  color: testFeedback.includes('failed') ? '#fecaca' : '#a7f3d0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                {testFeedback}
              </div>
            )}

            <form onSubmit={handleSendTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTestModalCampaign(null)}
                  style={{ padding: '8px 14px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isSendingTest ? 'not-allowed' : 'pointer' }}
                >
                  {isSendingTest ? 'Sending...' : 'Send Preview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

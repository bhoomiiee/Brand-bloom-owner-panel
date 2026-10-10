import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { marketingApi, Promotion } from '../api/marketing.api';
import { formatCurrency } from '../../../utils/currency';

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStore } = useActiveStoreStore();
  const storeId = activeStore?.id;

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [targetSegment, setTargetSegment] = useState<'ALL_OPTED_IN' | 'NEW_CUSTOMERS' | 'REPEAT_CUSTOMERS' | 'HIGH_VALUE' | 'INACTIVE'>('ALL_OPTED_IN');
  const [content, setContent] = useState(
    'Hi {{customer_name}},\n\nThank you for being a valued shopper at {{store_name}}! We are thrilled to share our latest collection with you.\n\nUse our special store offers during checkout.\n\nBest regards,\nThe {{store_name}} Team'
  );
  const [promotionCode, setPromotionCode] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    marketingApi
      .listPromotions(storeId)
      .then(res => {
        setPromotions(res.filter(p => p.isActive));
      })
      .catch(console.error);
  }, [storeId]);

  const handleSubmit = async (e: React.FormEvent, sendImmediately: boolean = false) => {
    e.preventDefault();
    if (!storeId) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const created = await marketingApi.createCampaign(storeId, {
        name: name.trim(),
        subject: subject.trim(),
        previewText: previewText.trim() || undefined,
        targetSegment,
        content: content.trim(),
        promotionCode: promotionCode.trim() || undefined
      });

      if (sendImmediately) {
        await marketingApi.sendCampaign(storeId, created.id);
      }

      navigate('/campaigns');
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
      setIsSubmitting(false);
    }
  };

  const insertVariable = (variable: string) => {
    setContent(prev => prev + ' ' + variable);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/campaigns" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Campaigns
        </Link>
      </div>

      <PageHeader
        title="Create Marketing Campaign"
        subtitle="Target engaged subscribers and drive attributed store revenue"
      />

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={e => handleSubmit(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Campaign Details</h3>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Internal Campaign Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. VIP Fall Collection Launch"
              style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Target Customer Segment *</label>
              <select
                value={targetSegment}
                onChange={e => setTargetSegment(e.target.value as any)}
                style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              >
                <option value="ALL_OPTED_IN">All Opted-In Subscribers</option>
                <option value="NEW_CUSTOMERS">New Customers (1 order)</option>
                <option value="REPEAT_CUSTOMERS">Repeat Customers (≥ 2 orders)</option>
                <option value="HIGH_VALUE">High Value Customers (Top spend)</option>
                <option value="INACTIVE">Inactive Customers (&gt; 90 days no purchase)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Attach Coupon Code (Optional)</label>
              <select
                value={promotionCode}
                onChange={e => setPromotionCode(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              >
                <option value="">None (informational only)</option>
                {promotions.map(p => (
                  <option key={p.id} value={p.code}>
                    {p.code} ({p.type === 'PERCENTAGE' ? `${p.value}% OFF` : `${formatCurrency(p.value)} OFF`})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Email Content & Template</h3>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Subject Line *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Exclusive Preview: Our Autumn Arrivals are Here!"
              style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Preview Text (Snippet)</label>
            <input
              type="text"
              value={previewText}
              onChange={e => setPreviewText(e.target.value)}
              placeholder="e.g. Special discounts inside for our favorite customers."
              style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', color: '#cbd5e1' }}>Message Body (Plain text / Markdown) *</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Insert tags:</span>
                <button
                  type="button"
                  onClick={() => insertVariable('{{customer_name}}')}
                  style={{ background: '#334155', color: '#c7d2fe', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  customer_name
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{store_name}}')}
                  style={{ background: '#334155', color: '#c7d2fe', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  store_name
                </button>
              </div>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '14px', lineHeight: '1.5', fontFamily: 'monospace' }}
            />
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              ℹ️ A 1-click unsubscribe footer link and physical store signature are automatically appended to comply with CAN-SPAM and GDPR requirements.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            style={{ padding: '12px 20px', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={e => handleSubmit(e, true)}
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Launching...' : 'Save & Send Immediately'}
          </button>
        </div>
      </form>
    </div>
  );
};

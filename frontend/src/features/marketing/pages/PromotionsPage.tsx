import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { marketingApi, Promotion } from '../api/marketing.api';
import { formatCurrency } from '../../../utils/currency';

export const PromotionsPage: React.FC = () => {
  const { activeStore } = useActiveStoreStore();
  const storeId = activeStore?.id;

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [value, setValue] = useState<number>(10);
  const [minSubtotal, setMinSubtotal] = useState<number>(0);
  const [totalUsageLimit, setTotalUsageLimit] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await marketingApi.listPromotions(storeId);
      setPromotions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load promotions');
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      await marketingApi.createPromotion(storeId, {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        type,
        value: type === 'FIXED_AMOUNT' ? Math.round(value * 100) : value,
        minimumOrderSubtotalCents: minSubtotal > 0 ? Math.round(minSubtotal * 100) : 0,
        totalUsageLimit: totalUsageLimit ? parseInt(totalUsageLimit, 10) : undefined,
        isActive: true
      });

      setIsModalOpen(false);
      setCode('');
      setDescription('');
      setValue(10);
      setMinSubtotal(0);
      setTotalUsageLimit('');
      fetchPromotions();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (p: Promotion) => {
    if (!storeId) return;
    try {
      await marketingApi.updatePromotion(storeId, p.id, { isActive: !p.isActive });
      fetchPromotions();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDelete = async (p: Promotion) => {
    if (!storeId) return;
    if (!window.confirm(`Delete promotion code "${p.code}"?`)) return;
    try {
      await marketingApi.deletePromotion(storeId, p.id);
      fetchPromotions();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <PageHeader
          title="Promotions & Discounts"
          subtitle="Create checkout coupons, set usage constraints, and measure revenue impact"
        />
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '10px 18px',
            background: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          + Create Coupon Code
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#94a3b8', padding: '48px', textAlign: 'center' }}>Loading promotions...</div>
      ) : promotions.length === 0 ? (
        <div style={{ padding: '48px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
          <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No promotions configured</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
            Drive customer acquisition and cart checkout conversion with discount coupons.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Create Your First Promotion
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '14px 16px' }}>Code</th>
                <th style={{ padding: '14px 16px' }}>Discount</th>
                <th style={{ padding: '14px 16px' }}>Conditions</th>
                <th style={{ padding: '14px 16px' }}>Usage</th>
                <th style={{ padding: '14px 16px' }}>Attributed Revenue</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{p.code}</div>
                    {p.description && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.description}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#a78bfa' }}>
                    {p.type === 'PERCENTAGE' ? `${p.value}% OFF` : `${formatCurrency(p.value)} OFF`}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94a3b8' }}>
                    {p.minimumOrderSubtotalCents && p.minimumOrderSubtotalCents > 0
                      ? `Min: ${formatCurrency(p.minimumOrderSubtotalCents)}`
                      : 'No min subtotal'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                    {p.usageCount} {p.totalUsageLimit ? `/ ${p.totalUsageLimit}` : 'uses'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#10b981' }}>
                    {formatCurrency(p.revenueGeneratedCents || 0)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: p.isActive ? '#064e3b' : '#334155',
                        color: p.isActive ? '#34d399' : '#94a3b8'
                      }}
                    >
                      {p.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleToggleActive(p)}
                        style={{
                          padding: '6px 10px',
                          background: '#334155',
                          color: '#f8fafc',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {p.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        style={{
                          padding: '6px 10px',
                          background: '#7f1d1d',
                          color: '#fca5a5',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '90%',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px',
              color: '#f8fafc'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Create Promotional Discount</h3>

            {formError && (
              <div style={{ marginBottom: '14px', padding: '10px', background: '#7f1d1d', color: '#fecaca', borderRadius: '6px', fontSize: '13px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Promo Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20, WELCOME10"
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. 20% off summer collection orders over ₹500"
                  style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Discount Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>
                    {type === 'PERCENTAGE' ? 'Percentage Value (%)' : 'Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={type === 'PERCENTAGE' ? '100' : '100000'}
                    required
                    value={value}
                    onChange={e => setValue(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Min Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minSubtotal}
                    onChange={e => setMinSubtotal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>Total Usage Cap</label>
                  <input
                    type="number"
                    min="1"
                    value={totalUsageLimit}
                    onChange={e => setTotalUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Creating...' : 'Save Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

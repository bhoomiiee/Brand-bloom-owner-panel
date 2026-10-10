import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { marketingApi, MarketingAnalytics } from '../api/marketing.api';
import { formatCurrency } from '../../../utils/currency';

export const MarketingAnalyticsPage: React.FC = () => {
  const { activeStore } = useActiveStoreStore();
  const storeId = activeStore?.id;

  const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!storeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await marketingApi.getAnalytics(storeId, timeframe);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate marketing metrics');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <PageHeader
          title="Marketing Analytics & ROI"
          subtitle="Auditable customer retention, acquisition economics, and promotion attribution"
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: '7d', label: 'Last 7 Days' },
            { key: '30d', label: 'Last 30 Days' },
            { key: '90d', label: 'Last 90 Days' },
            { key: 'all', label: 'All Time' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTimeframe(t.key)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: timeframe === t.key ? '#6366f1' : '#334155',
                background: timeframe === t.key ? '#4f46e5' : '#1e293b',
                color: timeframe === t.key ? '#fff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {analytics?.isInsufficientData && (
        <div style={{ marginBottom: '24px', padding: '14px 18px', background: '#451a03', border: '1px solid #b45309', borderRadius: '8px', color: '#fde68a', fontSize: '14px' }}>
          ⚠️ <strong>Limited Sample Size:</strong> Your store has fewer than 5 orders in this window. Retention and Lifetime Value figures are mathematical estimates and will become statistically robust as order volume grows.
        </div>
      )}

      {isLoading ? (
        <div style={{ color: '#94a3b8', padding: '48px', textAlign: 'center' }}>Computing marketing metrics...</div>
      ) : !analytics ? (
        <div style={{ color: '#94a3b8', padding: '48px', textAlign: 'center' }}>No marketing analytics data available.</div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {/* Customer Acquisition */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Customer Acquisition
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                {analytics.customerAcquisition.newCustomersInPeriod}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                New shoppers ({analytics.customerAcquisition.totalCustomers} total lifetime)
              </div>
            </div>

            {/* Repeat Purchase Rate */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Repeat Purchase Rate</span>
                <span style={{ fontSize: '11px', background: '#312e81', color: '#c7d2fe', padding: '2px 6px', borderRadius: '4px' }}>Formula</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#818cf8', marginBottom: '4px' }}>
                {analytics.retention.repeatPurchaseRate}%
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {analytics.retention.repeatPurchaseRateFormula}
              </div>
            </div>

            {/* Retention Rate */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Cohort Retention</span>
                <span style={{ fontSize: '11px', background: '#312e81', color: '#c7d2fe', padding: '2px 6px', borderRadius: '4px' }}>Formula</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#34d399', marginBottom: '4px' }}>
                {analytics.retention.customerRetentionRate}%
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {analytics.retention.customerRetentionRateFormula}
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Average Order Value (AOV)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                {formatCurrency(analytics.customerValue.averageOrderValueCents)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {analytics.customerValue.averageOrderValueFormula}
              </div>
            </div>

            {/* Customer Lifetime Value (CLV) */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Customer Lifetime Value
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
                {formatCurrency(analytics.customerValue.customerLifetimeValueCents)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {analytics.customerValue.customerLifetimeValueFormula}
              </div>
            </div>

            {/* Attributed Campaign Revenue */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Campaign Attributed Revenue
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
                {formatCurrency(analytics.campaignAttribution.totalAttributedRevenueCents)}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Across {analytics.campaignAttribution.totalAttributedOrdersCount} orders
              </div>
            </div>
          </div>

          {/* Breakdown Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Top Promotions */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: '0 0 16px 0' }}>
                Top Performing Coupons
              </h3>

              {analytics.topPromotions.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>No coupon usage recorded in this timeframe.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 0' }}>Code</th>
                      <th style={{ padding: '8px 0' }}>Discount</th>
                      <th style={{ padding: '8px 0' }}>Uses</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPromotions.map(promo => (
                      <tr key={promo.code} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                        <td style={{ padding: '10px 0', fontWeight: 700 }}>{promo.code}</td>
                        <td style={{ padding: '10px 0', color: '#a78bfa' }}>
                          {promo.type === 'PERCENTAGE' ? `${promo.value}%` : formatCurrency(promo.value)}
                        </td>
                        <td style={{ padding: '10px 0' }}>{promo.usageCount}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                          {formatCurrency(promo.totalRevenueCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Campaign Performance Breakdown */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', margin: '0 0 16px 0' }}>
                Campaign Attribution Breakdown
              </h3>

              {analytics.campaignAttribution.campaignBreakdown.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>No sent campaigns with attribution in this window.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 0' }}>Campaign</th>
                      <th style={{ padding: '8px 0' }}>Sent</th>
                      <th style={{ padding: '8px 0' }}>Orders</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Attributed Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.campaignAttribution.campaignBreakdown.map(c => (
                      <tr key={c.campaignId} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                        <td style={{ padding: '10px 0' }}>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.subject}</div>
                        </td>
                        <td style={{ padding: '10px 0' }}>{c.sentCount}</td>
                        <td style={{ padding: '10px 0', fontWeight: 600 }}>{c.attributedOrders}</td>
                        <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                          {formatCurrency(c.attributedRevenueCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

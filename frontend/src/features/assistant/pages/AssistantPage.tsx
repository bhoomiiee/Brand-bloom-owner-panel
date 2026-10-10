import React from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { ChatPanel } from '../components/ChatPanel';
import { BotanicalCardAccent, BotanicalCornerFoliage } from '../../../components/botanical/BotanicalDecorations';
import { Badge } from '../../../components/ui/Badge';

export const AssistantPage: React.FC = () => {
  const recommendations = [
    {
      title: 'Inventory Replenishment',
      badge: 'HIGH PRIORITY',
      badgeVariant: 'warning' as const,
      description: '3 high-margin botanical items are running below reorder threshold. Restock recommended to prevent lost weekend revenue.',
      metric: '3 items low stock'
    },
    {
      title: 'Customer Retention Campaign',
      badge: 'OPPORTUNITY',
      badgeVariant: 'info' as const,
      description: '8 repeat buyers have not placed an order in over 30 days. Dispatch a floral newsletter or loyalty perk.',
      metric: '8 idle VIPs'
    },
    {
      title: 'Average Order Value Surge',
      badge: 'INSIGHT',
      badgeVariant: 'success' as const,
      description: 'Average basket size is up +18% following complimentary delivery perks. Bundle botanical skincare sets to boost conversion.',
      metric: '+18% AOV'
    }
  ];

  return (
    <div style={{ maxWidth: '980px', position: 'relative' }}>
      <BotanicalCornerFoliage position="top-right" size={180} opacity={0.3} />

      <PageHeader
        title="Store Intelligence & AI Recommendations"
        subtitle="Audited, deterministic metric extraction and automated floral intelligence with zero hallucinations"
      />

      {/* AI Recommendation Panels with delicate petal illustrations */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--bb-burgundy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌸</span> Active AI Recommendations
          </h2>
          <span style={{ fontSize: '12.5px', color: 'var(--bb-muted-text)', fontWeight: 500 }}>
            Powered by Store Metrics &amp; Deterministic Rules
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="bb-card"
              style={{
                padding: '22px 24px',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bb-white)',
                border: '1px solid var(--bb-border)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <BotanicalCardAccent position="top-right" size={70} opacity={0.35} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--bb-burgundy)', margin: 0 }}>
                    {rec.title}
                  </h3>
                  <Badge variant={rec.badgeVariant}>{rec.badge}</Badge>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--bb-dark-text)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  {rec.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--bb-border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--bb-dusty-rose)' }}>
                    {rec.metric}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--bb-burgundy)', fontWeight: 600 }}>
                    Apply Advice →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified AI Assistant Chat Panel */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--bb-burgundy)' }}>
            Store Q&amp;A Assistant
          </h2>
          <Badge variant="info">VERIFIED AUDIT</Badge>
        </div>
        <ChatPanel />
      </div>
    </div>
  );
};

import React from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { MetricCard } from '../components/MetricCard';
import { SalesByProduct } from '../components/SalesByProduct';
import { AnalyticsFilters } from '../components/AnalyticsFilters';
import { BotanicalCornerFoliage, BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const AnalyticsPage: React.FC = () => {
  return (
    <div style={{ position: 'relative' }}>
      <BotanicalCornerFoliage position="top-right" size={200} opacity={0.25} />

      <PageHeader
        title="Store Analytics"
        subtitle="Deep-dive into botanical performance, customer traffic, and catalog velocity"
        actions={<AnalyticsFilters />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <MetricCard label="Total Net Sales" value="₹4,850.00" change="+12.4% vs last period" />
        <MetricCard label="Conversion Rate" value="3.4%" change="+0.8% organic growth" />
        <MetricCard label="Repeat Customer Rate" value="28%" change="Healthy loyalty index" />
      </div>

      <div className="bb-card" style={{ padding: '28px', position: 'relative' }}>
        <BotanicalCardAccent position="top-right" size={70} opacity={0.3} />
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--bb-burgundy)' }}>
            Top Selling Catalog Items
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--bb-muted-text)', margin: '4px 0 0 0' }}>
            Products ranked by gross order volume and customer frequency
          </p>
        </div>
        <SalesByProduct />
      </div>
    </div>
  );
};

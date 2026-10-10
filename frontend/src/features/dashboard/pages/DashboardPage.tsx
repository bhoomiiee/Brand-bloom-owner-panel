import React from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SalesSummary } from '../components/SalesSummary';
import { RevenueChart } from '../components/RevenueChart';
import { LowStockWidget } from '../components/LowStockWidget';
import { RecentActivity } from '../components/RecentActivity';
import { DashboardFilters } from '../components/DashboardFilters';
import { useDashboard } from '../hooks/useDashboard';
import { BotanicalCornerFoliage } from '../../../components/botanical/BotanicalDecorations';

export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useDashboard();

  const safeData = data || {
    revenueCents: 0,
    paidOrderCount: 0,
    averageOrderValueCents: 0,
    lowStockCount: 0
  };

  return (
    <div style={{ position: 'relative' }}>
      <BotanicalCornerFoliage position="bottom-right" size={260} opacity={0.28} />

      <PageHeader
        title="Store Overview"
        subtitle="Live metrics & inventory status"
        actions={<DashboardFilters />}
      />
      {isLoading && !data ? (
        <div style={{ color: 'var(--bb-muted-text)', padding: '32px 0', textAlign: 'center' }}>
          Loading store dashboard metrics...
        </div>
      ) : (
        <>
          <SalesSummary
            revenueCents={safeData.revenueCents}
            orderCount={safeData.paidOrderCount}
            aovCents={safeData.averageOrderValueCents}
          />
          <RevenueChart
            revenueCents={safeData.revenueCents}
            paidOrderCount={safeData.paidOrderCount}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <LowStockWidget count={safeData.lowStockCount} />
            <RecentActivity orders={(safeData as any).recentOrders || []} />
          </div>
        </>
      )}
    </div>
  );
};


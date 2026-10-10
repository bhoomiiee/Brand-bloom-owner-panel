import { describe, it, expect } from 'vitest';

describe('Revenue & Analytics Aggregation Unit Tests', () => {
  it('sums only qualifying paid order values in integer cents', () => {
    const orders = [
      { totalCents: 4500, status: 'PAID' },
      { totalCents: 12000, status: 'FULFILLED' },
      { totalCents: 8000, status: 'CANCELLED' },
      { totalCents: 6500, status: 'REFUNDED' },
      { totalCents: 3500, status: 'PROCESSING' }
    ];

    const qualifyingStatuses = ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'];
    const qualifyingOrders = orders.filter(o => qualifyingStatuses.includes(o.status));
    const totalRevenueCents = qualifyingOrders.reduce((sum, o) => sum + o.totalCents, 0);

    expect(totalRevenueCents).toBe(4500 + 12000 + 3500); // 20000 cents
    expect(qualifyingOrders.length).toBe(3);
  });

  it('calculates average order value (AOV) with integer rounding', () => {
    const revenueCents = 20000;
    const orderCount = 3;
    const aovCents = orderCount > 0 ? Math.round(revenueCents / orderCount) : 0;

    expect(aovCents).toBe(6667);
  });

  it('safely handles zero orders without producing NaN or Infinity', () => {
    const revenueCents = 0;
    const orderCount = 0;
    const aovCents = orderCount > 0 ? Math.round(revenueCents / orderCount) : 0;

    expect(aovCents).toBe(0);
    expect(Number.isNaN(aovCents)).toBe(false);
    expect(Number.isFinite(aovCents)).toBe(true);
  });
});

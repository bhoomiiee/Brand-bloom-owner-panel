import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const data = await dashboardApi.getSummary();
      return data || { revenueCents: 0, paidOrderCount: 0, averageOrderValueCents: 0, lowStockCount: 0, recentOrders: [] };
    }
  });
}

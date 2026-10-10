import { apiClient } from '../../../lib/api-client';

export const analyticsApi = {
  getMetrics: () => apiClient<any>('/analytics/dashboard'),
  getSalesByProduct: () => apiClient<any[]>('/analytics/sales-by-product')
};

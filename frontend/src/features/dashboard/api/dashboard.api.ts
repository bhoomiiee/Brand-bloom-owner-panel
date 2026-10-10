import { apiClient } from '../../../lib/api-client';

export const dashboardApi = {
  getSummary: () => apiClient<any>('/analytics/dashboard')
};

import { apiClient } from '../../../lib/api-client';

export const inventoryApi = {
  list: () => apiClient<any[]>('/inventory'),
  adjust: (data: any) => apiClient<any>('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) })
};

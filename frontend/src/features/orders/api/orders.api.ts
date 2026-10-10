import { apiClient } from '../../../lib/api-client';

export const ordersApi = {
  list: () => apiClient<any[]>('/orders'),
  getById: (id: string) => apiClient<any>(`/orders/${id}`),
  updateStatus: (id: string, status: string) => apiClient<any>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

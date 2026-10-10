import { apiClient } from '../../../lib/api-client';

export const productsApi = {
  list: (params?: any) => apiClient<any[]>('/products'),
  getById: (id: string) => apiClient<any>(`/products/${id}`),
  create: (data: any) => apiClient<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient<any>(`/products/${id}`, { method: 'DELETE' })
};

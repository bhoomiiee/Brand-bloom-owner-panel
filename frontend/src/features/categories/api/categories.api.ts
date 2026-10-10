import { apiClient } from '../../../lib/api-client';

export const categoriesApi = {
  list: () => apiClient<any[]>('/categories'),
  create: (data: any) => apiClient<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient<any>(`/categories/${id}`, { method: 'DELETE' })
};

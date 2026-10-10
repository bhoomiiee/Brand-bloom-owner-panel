import { apiClient } from '../../../lib/api-client';

export const teamApi = {
  list: () => apiClient<any[]>('/memberships'),
  invite: (data: any) => apiClient<any>('/memberships/invite', { method: 'POST', body: JSON.stringify(data) }),
  updatePermissions: (id: string, permissions: string[]) => apiClient<any>(`/memberships/${id}/permissions`, { method: 'PATCH', body: JSON.stringify({ permissions }) }),
  remove: (id: string) => apiClient<any>(`/memberships/${id}`, { method: 'DELETE' })
};

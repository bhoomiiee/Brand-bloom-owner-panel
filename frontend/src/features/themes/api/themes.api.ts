import { apiClient } from '../../../lib/api-client';

export const themesApi = {
  getRegistry: () => apiClient<any[]>('/themes/registry'),
  getConfig: () => apiClient<any>('/themes/config'),
  updateConfig: (data: any) => apiClient<any>('/themes/config', { method: 'PUT', body: JSON.stringify(data) }),
  publish: () => apiClient<any>('/themes/publish', { method: 'POST' })
};

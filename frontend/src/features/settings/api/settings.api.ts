import { apiClient } from '../../../lib/api-client';

export const settingsApi = {
  getProfile: () => apiClient<any>('/stores/me'),
  updateProfile: (data: any) => apiClient<any>('/stores/me', { method: 'PUT', body: JSON.stringify(data) })
};

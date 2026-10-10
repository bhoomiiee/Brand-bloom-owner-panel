import { apiClient } from '../../../lib/api-client';

export const assistantApi = {
  ask: (question: string) => apiClient<any>('/assistant/query', { method: 'POST', body: JSON.stringify({ question }) })
};

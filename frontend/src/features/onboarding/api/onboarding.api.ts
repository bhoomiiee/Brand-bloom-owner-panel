import { apiClient } from '../../../lib/api-client';

export const onboardingApi = {
  getDraft: () => apiClient<any>('/onboarding/draft'),
  saveDraft: (data: any) => apiClient<any>('/onboarding/draft', { method: 'POST', body: JSON.stringify(data) }),
  complete: () => apiClient<any>('/onboarding/complete', { method: 'POST' })
};

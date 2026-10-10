import { apiClient } from '../../../lib/api-client';
import { UserProfile } from '../../../store/auth.store';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient<{ user: UserProfile; sessionId: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  register: (data: { name?: string; firstName?: string; lastName?: string; email: string; password: string }) =>
    apiClient<{ user: UserProfile; sessionId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () =>
    apiClient<{ user: UserProfile }>('/auth/me'),

  logout: () =>
    apiClient<{ message: string }>('/auth/logout', {
      method: 'POST'
    }),

  forgotPassword: (email: string) =>
    apiClient<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (data: any) =>
    apiClient<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

import { apiClient } from '../../../lib/api-client';

export interface StoreItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  businessType: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  logoUrl?: string;
  settings?: {
    currency?: string;
    timezone?: string;
    taxRatePercentage?: number;
  };
  membership?: {
    id: string;
    role: 'owner' | 'staff';
    status: 'active' | 'suspended';
  };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreInput {
  name: string;
  slug?: string;
  businessType?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  currency?: string;
  timezone?: string;
}

export interface UpdateStoreInput {
  name?: string;
  businessType?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  settings?: {
    currency?: string;
    timezone?: string;
    taxRatePercentage?: number;
  };
}

export const storesApi = {
  list: () => apiClient<StoreItem[]>('/stores'),

  getById: (storeId: string) => apiClient<StoreItem>(`/stores/${storeId}`),

  create: (data: CreateStoreInput) =>
    apiClient<{ store: StoreItem; role: string }>('/stores', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (storeId: string, data: UpdateStoreInput) =>
    apiClient<StoreItem>(`/stores/${storeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  addMember: (storeId: string, data: { email: string; role: 'staff' }) =>
    apiClient<any>(`/stores/${storeId}/members`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  listMembers: (storeId: string) =>
    apiClient<any[]>(`/stores/${storeId}/members`)
};

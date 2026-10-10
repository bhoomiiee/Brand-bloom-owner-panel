import { apiClient } from '../../../lib/api-client';

export interface CustomerSummary {
  id: string;
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  segment: 'new' | 'repeat' | 'high_value' | 'inactive';
  orderCount: number;
  totalSpentCents: number;
  lastOrderDate?: string;
  marketingConsent: {
    emailOptIn: boolean;
    smsOptIn: boolean;
    optInDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  customers: CustomerSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  segmentCounts: {
    all: number;
    new: number;
    repeat: number;
    high_value: number;
    inactive: number;
  };
  metrics?: {
    totalCustomers: number;
    totalLifetimeValueCents: number;
    averageCustomerValueCents: number;
  };
}

export interface CustomerDetailResponse {
  customer: CustomerSummary & {
    addresses: Array<{
      id?: string;
      _id?: string;
      label?: string;
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      isDefault?: boolean;
    }>;
  };
  orders: any[];
  consentHistory: any[];
}

export const customersApi = {
  list: (storeId: string, params: { search?: string; segment?: string; sort?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.segment) query.append('segment', params.segment);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    return apiClient<CustomerListResponse>(`/stores/${storeId}/customers?${query.toString()}`);
  },

  getDetails: (storeId: string, customerId: string) => {
    return apiClient<CustomerDetailResponse>(`/stores/${storeId}/customers/${customerId}`);
  },

  exportData: (storeId: string, customerId: string) => {
    return apiClient<any>(`/stores/${storeId}/customers/${customerId}/export`);
  },

  deleteData: (storeId: string, customerId: string) => {
    return apiClient<{ message: string }>(`/stores/${storeId}/customers/${customerId}`, {
      method: 'DELETE'
    });
  }
};

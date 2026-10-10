import { apiClient } from '../../lib/api-client';

export const customerApi = {
  async register(storeSlug: string, data: any) {
    return apiClient<{ customer: any; token: string }>(`/storefront/${storeSlug}/customer/register`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async login(storeSlug: string, email: string, password: string) {
    return apiClient<{ customer: any; token: string }>(`/storefront/${storeSlug}/customer/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getProfile(storeSlug: string) {
    return apiClient<any>(`/storefront/${storeSlug}/customer/me`);
  },

  async updateProfile(storeSlug: string, data: any) {
    return apiClient<any>(`/storefront/${storeSlug}/customer/me`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async addAddress(storeSlug: string, data: any) {
    return apiClient<any>(`/storefront/${storeSlug}/customer/addresses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAddress(storeSlug: string, addressId: string) {
    return apiClient<any>(`/storefront/${storeSlug}/customer/addresses/${addressId}`, {
      method: 'DELETE'
    });
  },

  async getOrders(storeSlug: string) {
    return apiClient<any[]>(`/storefront/${storeSlug}/customer/orders`);
  },

  async getOrder(storeSlug: string, orderNumber: string) {
    return apiClient<any>(`/storefront/${storeSlug}/customer/orders/${orderNumber}`);
  },

  async claimGuestOrders(storeSlug: string) {
    return apiClient<{ claimedCount: number; totalOrdersCount: number; totalSpendCents: number }>(
      `/storefront/${storeSlug}/customer/claim-guest-orders`,
      { method: 'POST' }
    );
  },

  async updateConsent(storeSlug: string, emailOptIn: boolean) {
    return apiClient<any>(`/storefront/${storeSlug}/customer/consent`, {
      method: 'PUT',
      body: JSON.stringify({ emailOptIn })
    });
  },

  async validatePromotionCode(storeSlug: string, code: string, subtotalCents: number) {
    return apiClient<{
      valid: boolean;
      code: string;
      discountCents: number;
      message?: string;
    }>(`/storefront/${storeSlug}/promotions/validate`, {
      method: 'POST',
      body: JSON.stringify({ code, subtotalCents })
    });
  }
};

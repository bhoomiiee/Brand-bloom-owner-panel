import { apiClient } from '../../../lib/api-client';

export interface Promotion {
  id: string;
  storeId: string;
  code: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minimumOrderSubtotalCents?: number;
  maxDiscountCents?: number;
  totalUsageLimit?: number;
  perCustomerLimit?: number;
  usageCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  revenueGeneratedCents?: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  storeId: string;
  name: string;
  subject: string;
  previewText?: string;
  targetSegment: 'ALL_OPTED_IN' | 'NEW_CUSTOMERS' | 'REPEAT_CUSTOMERS' | 'HIGH_VALUE' | 'INACTIVE';
  content: string;
  promotionCode?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  sentAt?: string;
  scheduledFor?: string;
  metrics: {
    totalTargeted: number;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    unsubscribedCount: number;
    attributedOrdersCount: number;
    attributedRevenueCents: number;
  };
  createdAt: string;
}

export interface MarketingAnalytics {
  timeframe: string;
  isInsufficientData: boolean;
  customerAcquisition: {
    totalCustomers: number;
    newCustomersInPeriod: number;
    payingCustomersCount: number;
  };
  retention: {
    repeatPurchaseRate: number;
    repeatPurchaseRateFormula: string;
    customerRetentionRate: number;
    customerRetentionRateFormula: string;
    totalOrders: number;
    repeatOrdersCount: number;
  };
  customerValue: {
    averageOrderValueCents: number;
    averageOrderValueFormula: string;
    customerLifetimeValueCents: number;
    customerLifetimeValueFormula: string;
    totalRevenueCents: number;
  };
  campaignAttribution: {
    totalAttributedRevenueCents: number;
    totalAttributedOrdersCount: number;
    campaignBreakdown: Array<{
      campaignId: string;
      name: string;
      subject: string;
      sentAt?: string;
      sentCount: number;
      attributedOrders: number;
      attributedRevenueCents: number;
    }>;
  };
  topPromotions: Array<{
    code: string;
    type: string;
    value: number;
    usageCount: number;
    totalRevenueCents: number;
  }>;
}

export const marketingApi = {
  // Promotions
  listPromotions: (storeId: string) => {
    return apiClient<Promotion[]>(`/stores/${storeId}/marketing/promotions`);
  },

  createPromotion: (storeId: string, data: Partial<Promotion>) => {
    return apiClient<Promotion>(`/stores/${storeId}/marketing/promotions`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updatePromotion: (storeId: string, promotionId: string, data: Partial<Promotion>) => {
    return apiClient<Promotion>(`/stores/${storeId}/marketing/promotions/${promotionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  deletePromotion: (storeId: string, promotionId: string) => {
    return apiClient<{ message: string }>(`/stores/${storeId}/marketing/promotions/${promotionId}`, {
      method: 'DELETE'
    });
  },

  // Campaigns
  listCampaigns: (storeId: string) => {
    return apiClient<Campaign[]>(`/stores/${storeId}/marketing/campaigns`);
  },

  createCampaign: (storeId: string, data: Partial<Campaign>) => {
    return apiClient<Campaign>(`/stores/${storeId}/marketing/campaigns`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  sendCampaign: (storeId: string, campaignId: string) => {
    return apiClient<{ message: string; campaign: Campaign }>(`/stores/${storeId}/marketing/campaigns/${campaignId}/send`, {
      method: 'POST'
    });
  },

  sendTestEmail: (storeId: string, campaignId: string, testEmail: string) => {
    return apiClient<{ message: string }>(`/stores/${storeId}/marketing/campaigns/${campaignId}/test`, {
      method: 'POST',
      body: JSON.stringify({ testEmail })
    });
  },

  // Analytics
  getAnalytics: (storeId: string, timeframe?: string) => {
    const query = timeframe ? `?timeframe=${timeframe}` : '';
    return apiClient<MarketingAnalytics>(`/stores/${storeId}/marketing/analytics${query}`);
  }
};

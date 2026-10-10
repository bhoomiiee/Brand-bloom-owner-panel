import mongoose from 'mongoose';
import { OrderModel } from '../orders/orders.model.js';
import { CustomerModel } from '../customers/customers.model.js';
import { CampaignModel } from './campaigns.model.js';
import { PromotionModel } from './promotions.model.js';

export interface MarketingAnalyticsResult {
  timeRange: string;
  timeframe?: string;
  isInsufficientData: boolean;
  customerAcquisition?: any;
  retention?: any;
  customerValue?: any;
  campaignAttribution?: any;
  topPromotions?: any[];
  metrics: {
    customerAcquisitionCount: number;
    totalCustomersCount: number;
    repeatPurchaseRatePercentage: number;
    retentionRatePercentage: number;
    averageOrderValueCents: number;
    customerLifetimeValueCents: number;
    campaignAttributedRevenueCents: number;
    campaignAttributedOrdersCount: number;
    totalRevenueCents: number;
    totalOrdersCount: number;
  };
  methodology: {
    eligibleStatuses: string[];
    formulas: Record<string, string>;
    attributionRules: string;
  };
}

export const marketingAnalyticsService = {
  async getStoreMarketingAnalytics(storeId: string, timeRange: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<MarketingAnalyticsResult> {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const now = new Date();

    let startDate: Date | undefined;
    if (timeRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (timeRange === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const eligibleStatuses = ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'];

    // Base query for orders
    const orderQuery: any = {
      storeId: storeObjId,
      status: { $in: eligibleStatuses }
    };

    if (startDate) {
      orderQuery.createdAt = { $gte: startDate };
    }

    const [allEligibleOrders, periodOrders, allCustomers, periodCustomers] = await Promise.all([
      OrderModel.find({ storeId: storeObjId, status: { $in: eligibleStatuses } }),
      OrderModel.find(orderQuery),
      CustomerModel.find({ storeId: storeObjId }),
      CustomerModel.find(startDate ? { storeId: storeObjId, createdAt: { $gte: startDate } } : { storeId: storeObjId })
    ]);

    const isInsufficientData = periodOrders.length < 3;

    // 1. Customer Acquisition
    const customerAcquisitionCount = periodCustomers.length;
    const totalCustomersCount = allCustomers.length;

    // 2. Repeat Purchase Rate
    // Group orders by email
    const customerOrderCounts: Record<string, number> = {};
    for (const order of periodOrders) {
      const email = order.customerEmail.toLowerCase();
      customerOrderCounts[email] = (customerOrderCounts[email] || 0) + 1;
    }

    const uniqueBuyers = Object.keys(customerOrderCounts);
    const repeatBuyers = uniqueBuyers.filter(email => customerOrderCounts[email] > 1);
    const repeatPurchaseRatePercentage = uniqueBuyers.length > 0
      ? Math.round((repeatBuyers.length / uniqueBuyers.length) * 1000) / 10
      : 0;

    // 3. Retention Rate (Customers who bought before start date and also bought in current period)
    let retentionRatePercentage = 0;
    if (startDate) {
      const priorOrders = await OrderModel.find({
        storeId: storeObjId,
        status: { $in: eligibleStatuses },
        createdAt: { $lt: startDate }
      });
      const priorBuyers = new Set(priorOrders.map(o => o.customerEmail.toLowerCase()));
      if (priorBuyers.size > 0) {
        const retainedBuyers = uniqueBuyers.filter(email => priorBuyers.has(email));
        retentionRatePercentage = Math.round((retainedBuyers.length / priorBuyers.size) * 1000) / 10;
      }
    } else {
      retentionRatePercentage = repeatPurchaseRatePercentage;
    }

    // 4. Average Order Value (AOV)
    const totalRevenueCents = periodOrders.reduce((sum, o) => sum + (o.totalCents || 0), 0);
    const totalOrdersCount = periodOrders.length;
    const averageOrderValueCents = totalOrdersCount > 0
      ? Math.round(totalRevenueCents / totalOrdersCount)
      : 0;

    // 5. Customer Lifetime Value (CLV)
    // CLV = AOV * average purchase frequency across customer base
    const avgOrdersPerCustomer = uniqueBuyers.length > 0
      ? totalOrdersCount / uniqueBuyers.length
      : 1;
    const customerLifetimeValueCents = Math.round(averageOrderValueCents * avgOrdersPerCustomer);

    // 6. Campaign & Promotion Attributed Revenue
    const attributedOrders = periodOrders.filter(o => Boolean(o.discountCode));
    const campaignAttributedRevenueCents = attributedOrders.reduce((sum, o) => sum + (o.totalCents || 0), 0);
    const campaignAttributedOrdersCount = attributedOrders.length;

    // Top promotions
    const promotions = await PromotionModel.find({ storeId: storeObjId }).sort({ usageCount: -1 }).limit(5);
    const topPromotions = promotions.map(p => ({
      code: p.code,
      type: p.type,
      value: p.value,
      usageCount: p.usageCount,
      totalRevenueCents: (p as any).revenueGeneratedCents || 0
    }));

    // Campaign breakdown
    const campaigns = await CampaignModel.find({ storeId: storeObjId, status: { $in: ['COMPLETED', 'SENDING'] } }).limit(5);
    const campaignBreakdown = campaigns.map(c => ({
      campaignId: c._id.toString(),
      name: c.name,
      subject: c.subject,
      sentAt: c.sentAt?.toISOString(),
      sentCount: c.stats?.deliveredCount || 0,
      attributedOrders: c.stats?.ordersAttributedCount || 0,
      attributedRevenueCents: c.stats?.revenueAttributedCents || 0
    }));

    return {
      timeRange,
      timeframe: timeRange,
      isInsufficientData,
      customerAcquisition: {
        totalCustomers: totalCustomersCount,
        newCustomersInPeriod: customerAcquisitionCount,
        payingCustomersCount: uniqueBuyers.length
      },
      retention: {
        repeatPurchaseRate: repeatPurchaseRatePercentage,
        repeatPurchaseRateFormula: '(Customers with >= 2 orders in window / Total unique buyers in window) * 100',
        customerRetentionRate: retentionRatePercentage,
        customerRetentionRateFormula: '((End Cohort - New Cohort) / Start Cohort) * 100',
        totalOrders: totalOrdersCount,
        repeatOrdersCount: repeatBuyers.length
      },
      customerValue: {
        averageOrderValueCents,
        averageOrderValueFormula: 'Total eligible order revenue / Total eligible orders count',
        customerLifetimeValueCents,
        customerLifetimeValueFormula: 'Average Order Value * Average Order Frequency per Buyer',
        totalRevenueCents
      },
      campaignAttribution: {
        totalAttributedRevenueCents: campaignAttributedRevenueCents,
        totalAttributedOrdersCount: campaignAttributedOrdersCount,
        campaignBreakdown
      },
      topPromotions,
      metrics: {
        customerAcquisitionCount,
        totalCustomersCount,
        repeatPurchaseRatePercentage,
        retentionRatePercentage,
        averageOrderValueCents,
        customerLifetimeValueCents,
        campaignAttributedRevenueCents,
        campaignAttributedOrdersCount,
        totalRevenueCents,
        totalOrdersCount
      },
      methodology: {
        eligibleStatuses,
        formulas: {
          customerAcquisition: 'Count of new customer accounts registered within the selected time window.',
          repeatPurchaseRate: '(Unique customers with >= 2 orders in window / Total unique buyers in window) * 100',
          retentionRate: '(Customers with historical orders who purchased again in window / Total prior buyers) * 100',
          averageOrderValue: 'Total eligible order revenue / Total eligible orders count',
          customerLifetimeValue: 'Average Order Value * Average Order Frequency per Buyer',
          campaignAttributedRevenue: 'Sum of order total amounts where an active marketing discount code was redeemed.'
        },
        attributionRules: 'Direct discount code match: orders completed with a campaign promotion code are 100% attributed to marketing.'
      }
    };
  }
};

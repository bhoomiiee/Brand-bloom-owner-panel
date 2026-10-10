import { approvedQueries } from './approved-queries.js';

export const queryPlannerService = {
  async execute(storeId: string, intent: { metric: string; isSupported?: boolean }) {
    switch (intent.metric) {
      case 'revenue':
        return approvedQueries.revenue(storeId);
      case 'paid-order-count':
        return approvedQueries.orderCount(storeId);
      case 'average-order-value':
        return approvedQueries.averageOrderValue(storeId);
      case 'low-stock-products':
        return approvedQueries.lowStock(storeId);
      case 'sales-by-product':
        return approvedQueries.salesByProduct(storeId);
      default:
        return { unsupported: true };
    }
  }
};

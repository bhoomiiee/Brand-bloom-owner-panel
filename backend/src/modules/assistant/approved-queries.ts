import { revenueQuery } from './approved-queries/revenue.query.js';
import { orderCountQuery } from './approved-queries/order-count.query.js';
import { salesByProductQuery } from './approved-queries/sales-by-product.query.js';
import { lowStockQuery } from './approved-queries/low-stock.query.js';
import { averageOrderValueQuery } from './approved-queries/average-order-value.query.js';

export const approvedQueries = {
  revenue: revenueQuery,
  orderCount: orderCountQuery,
  salesByProduct: salesByProductQuery,
  lowStock: lowStockQuery,
  averageOrderValue: averageOrderValueQuery
};

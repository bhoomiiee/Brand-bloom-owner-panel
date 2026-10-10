export const assistantPolicy = {
  isQueryAllowed: (metric: string) => ['revenue', 'paid-order-count', 'average-order-value', 'sales-by-product', 'low-stock-products'].includes(metric)
};

export function computeRevenue(orders: Array<{ totalCents: number }>): number {
  return orders.reduce((acc, curr) => acc + curr.totalCents, 0);
}

export const pricingService = {
  calculateSubtotal(items: Array<{ priceCents: number; quantity: number }>) {
    return items.reduce((acc, curr) => acc + curr.priceCents * curr.quantity, 0);
  }
};

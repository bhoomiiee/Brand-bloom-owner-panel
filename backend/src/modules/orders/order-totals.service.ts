export const orderTotalsService = {
  compute: (items: any[]) => items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
};

export const productPricingService = {
  calculateDiscountPercentage(basePriceCents: number, compareAtPriceCents?: number): number {
    if (!compareAtPriceCents || compareAtPriceCents <= basePriceCents) return 0;
    return Math.round(((compareAtPriceCents - basePriceCents) / compareAtPriceCents) * 100);
  }
};

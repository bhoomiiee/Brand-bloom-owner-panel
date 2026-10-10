export const productsPolicy = {
  canPublish: (product: any) => Boolean(product.title && product.basePriceCents >= 0)
};

export const publicProductService = {
  formatForStorefront: (product: any) => ({
    id: product._id,
    title: product.title,
    priceCents: product.basePriceCents,
    images: product.images
  })
};

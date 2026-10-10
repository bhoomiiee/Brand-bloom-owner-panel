import { StoreModel } from '../stores/stores.model.js';
import { StorefrontConfigModel } from '../themes/storefront-config.model.js';
import { ProductModel } from '../products/products.model.js';
import { ProductVariantModel } from '../products/product-variants.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

import { InventoryModel } from '../inventory/inventory.model.js';

export const storefrontService = {
  async getConfigBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug });
    if (!store) throw new AppError('Store not found', 404, ERROR_CODES.NOT_FOUND);

    const themeConfig = await StorefrontConfigModel.findOne({ storeId: store._id });
    const publicTheme = themeConfig?.publishedConfig || {
      themeId: themeConfig?.themeId || 'minimal',
      colors: themeConfig?.colors || { primary: '#111827', accent: '#3b82f6', background: '#ffffff', surface: '#f9fafb' },
      typography: themeConfig?.typography || { headingFont: 'Inter', bodyFont: 'Inter' },
      sections: themeConfig?.sections || [
        { type: 'hero', enabled: true, settings: { headline: 'Welcome to our store' } },
        { type: 'featured-products', enabled: true, settings: { limit: 8 } }
      ]
    };

    return {
      store: {
        id: store._id,
        name: store.name,
        slug: store.slug,
        currency: store.settings?.currency || 'USD'
      },
      themeConfig: publicTheme
    };
  },

  async getProductsBySlug(storeSlug: string, query: any = {}) {
    const store = await StoreModel.findOne({ slug: storeSlug });
    if (!store) throw new AppError('Store not found', 404, ERROR_CODES.NOT_FOUND);

    const filter: any = { storeId: store._id, status: 'ACTIVE', isArchived: false };
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };

    const products = await ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(48)
      .populate('categoryId', 'name slug');

    // Attach primary variant info for each product
    const productsWithPricing = await Promise.all(
      products.map(async (prod) => {
        const variant = await ProductVariantModel.findOne({ productId: prod._id, storeId: store._id });
        const inv = variant ? await InventoryModel.findOne({ variantId: variant._id, storeId: store._id }) : null;
        return {
          _id: prod._id,
          title: prod.title,
          slug: prod.slug,
          description: prod.description,
          basePriceCents: prod.basePriceCents,
          compareAtPriceCents: prod.compareAtPriceCents,
          images: prod.images,
          category: prod.categoryId,
          defaultVariantId: variant?._id,
          sku: variant?.sku,
          isAvailable: (inv?.onHand ?? 0) > 0
        };
      })
    );

    return productsWithPricing;
  },

  async getProductDetail(storeSlug: string, productSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug });
    if (!store) throw new AppError('Store not found', 404, ERROR_CODES.NOT_FOUND);

    const product = await ProductModel.findOne({ storeId: store._id, slug: productSlug, status: 'ACTIVE', isArchived: false })
      .populate('categoryId', 'name slug');
    if (!product) throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);

    const variants = await ProductVariantModel.find({ productId: product._id, storeId: store._id });
    const variantsWithAvailability = await Promise.all(
      variants.map(async (v) => {
        const inv = await InventoryModel.findOne({ variantId: v._id, storeId: store._id });
        return {
          _id: v._id,
          sku: v.sku,
          title: v.title,
          priceCents: v.priceCents,
          barcode: v.barcode,
          attributes: v.attributes,
          inStock: (inv?.onHand ?? 0) > 0
        };
      })
    );

    return {
      product: {
        _id: product._id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        basePriceCents: product.basePriceCents,
        compareAtPriceCents: product.compareAtPriceCents,
        images: product.images,
        category: product.categoryId
      },
      variants: variantsWithAvailability
    };
  }
};

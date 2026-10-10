import { ProductModel } from './products.model.js';
import { ProductVariantModel } from './product-variants.model.js';
import { InventoryModel } from '../inventory/inventory.model.js';
import { slugify } from '../../shared/utils/slug.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { buildPaginationMeta } from '../../shared/http/pagination.js';

export const productsService = {
  async list(storeId: string, pagination: any, filters: any) {
    const query: any = { storeId, isArchived: false };
    if (filters.status) query.status = filters.status;
    if (filters.search) query.title = { $regex: filters.search, $options: 'i' };

    const total = await ProductModel.countDocuments(query);
    const items = await ProductModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('categoryId', 'name');

    return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  },

  async create(storeId: string, data: any) {
    const slug = slugify(data.title);
    const sku = data.sku?.trim() || `SKU-${Date.now().toString(36).toUpperCase()}`;
    const existingSku = await ProductVariantModel.findOne({ storeId, sku });
    if (existingSku) {
      throw new AppError('SKU already exists in this store', 409, ERROR_CODES.CONFLICT);
    }

    const product = await ProductModel.create({
      storeId,
      title: data.title,
      slug,
      description: data.description,
      categoryId: data.categoryId || null,
      basePriceCents: data.basePriceCents,
      compareAtPriceCents: data.compareAtPriceCents,
      images: data.images || [],
      status: data.status || 'ACTIVE'
    });

    // Create default variant
    const variant = await ProductVariantModel.create({
      storeId,
      productId: product._id,
      sku,
      title: data.variantTitle || 'Default Variant',
      priceCents: data.basePriceCents
    });

    await InventoryModel.create({
      storeId,
      variantId: variant._id,
      onHand: data.initialStock || 0,
      reserved: 0
    });

    return product;
  },

  async getById(storeId: string, id: string) {
    const product = await ProductModel.findOne({ _id: id, storeId });
    if (!product) throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
    const variants = await ProductVariantModel.find({ productId: product._id, storeId });
    const variantsWithInventory = await Promise.all(
      variants.map(async (v) => {
        const inv = await InventoryModel.findOne({ storeId, variantId: v._id });
        return {
          ...v.toObject(),
          onHand: inv?.onHand ?? 0,
          reserved: inv?.reserved ?? 0
        };
      })
    );
    return { product, variants: variantsWithInventory };
  },

  async update(storeId: string, id: string, data: any) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title);
    }
    const product = await ProductModel.findOneAndUpdate({ _id: id, storeId }, data, { new: true });
    if (!product) throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);

    if (data.basePriceCents !== undefined) {
      await ProductVariantModel.updateMany(
        { productId: product._id, storeId },
        { priceCents: data.basePriceCents }
      );
    }

    return product;
  },

  async delete(storeId: string, id: string) {
    const product = await ProductModel.findOneAndUpdate({ _id: id, storeId }, { isArchived: true }, { new: true });
    if (!product) throw new AppError('Product not found', 404, ERROR_CODES.NOT_FOUND);
    return product;
  },

  async bulkUpdate(storeId: string, updates: Array<{ id: string; data: any }>) {
    const results = { updated: 0, failed: 0, errors: [] as any[] };
    for (const item of updates) {
      try {
        const updated = await ProductModel.findOneAndUpdate({ _id: item.id, storeId }, item.data, { new: true });
        if (updated) {
          results.updated++;
        } else {
          results.failed++;
          results.errors.push({ id: item.id, error: 'Product not found' });
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({ id: item.id, error: err.message });
      }
    }
    return results;
  }
};

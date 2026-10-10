import mongoose from 'mongoose';
import { ProductModel } from '../../modules/products/products.model.js';
import { ProductVariantModel } from '../../modules/products/product-variants.model.js';
import { InventoryModel } from '../../modules/inventory/inventory.model.js';

export async function seedSampleProducts(storeId: mongoose.Types.ObjectId, categoryId: mongoose.Types.ObjectId) {
  const existing = await ProductModel.findOne({ storeId });
  if (existing) return;

  const product = await ProductModel.create({
    storeId,
    title: 'Minimalist Linen Shirt',
    slug: 'minimalist-linen-shirt',
    description: '100% organic breathable linen everyday classic.',
    categoryId,
    status: 'ACTIVE',
    basePriceCents: 6800,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c']
  });

  const variant = await ProductVariantModel.create({
    storeId,
    productId: product._id,
    sku: 'LINEN-WHT-M',
    title: 'White / Medium',
    priceCents: 6800,
    attributes: { color: 'White', size: 'M' }
  });

  await InventoryModel.create({
    storeId,
    variantId: variant._id,
    onHand: 45,
    reserved: 0,
    lowStockThreshold: 10
  });
}

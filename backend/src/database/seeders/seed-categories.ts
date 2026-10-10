import mongoose from 'mongoose';
import { CategoryModel } from '../../modules/categories/categories.model.js';

export async function seedCategories(storeId: mongoose.Types.ObjectId) {
  const existing = await CategoryModel.find({ storeId });
  if (existing.length > 0) return existing;

  return await CategoryModel.insertMany([
    { storeId, name: 'Apparel', slug: 'apparel', description: 'Curated modern fashion' },
    { storeId, name: 'Accessories', slug: 'accessories', description: 'Bags, watches and jewelry' },
    { storeId, name: 'Home Goods', slug: 'home-goods', description: 'Aesthetic home decor' }
  ]);
}

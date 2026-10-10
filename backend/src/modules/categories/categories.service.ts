import { CategoryModel } from './categories.model.js';
import { ProductModel } from '../products/products.model.js';
import { slugify } from '../../shared/utils/slug.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const categoriesService = {
  async listByStore(storeId: string) {
    return CategoryModel.find({ storeId }).sort({ order: 1, name: 1 });
  },

  async create(storeId: string, data: { name: string; description?: string; parentId?: string; order?: number }) {
    const slug = slugify(data.name);
    const existing = await CategoryModel.findOne({ storeId, slug });
    if (existing) throw new AppError('Category with this slug exists', 409, ERROR_CODES.CONFLICT);

    return CategoryModel.create({
      storeId,
      name: data.name,
      slug,
      description: data.description,
      parentId: data.parentId || null,
      order: data.order || 0
    });
  },

  async update(storeId: string, id: string, data: any) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }
    const cat = await CategoryModel.findOneAndUpdate({ _id: id, storeId }, data, { new: true });
    if (!cat) throw new AppError('Category not found', 404, ERROR_CODES.NOT_FOUND);
    return cat;
  },

  async delete(storeId: string, id: string) {
    const cat = await CategoryModel.findOne({ _id: id, storeId });
    if (!cat) throw new AppError('Category not found', 404, ERROR_CODES.NOT_FOUND);
    await ProductModel.updateMany({ storeId, categoryId: id }, { $unset: { categoryId: 1 } });
    await CategoryModel.deleteOne({ _id: id, storeId });
  }
};

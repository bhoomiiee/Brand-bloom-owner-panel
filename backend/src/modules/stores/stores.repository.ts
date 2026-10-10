import { StoreModel } from './stores.model.js';

export const storesRepository = {
  findById: (id: string) => StoreModel.findById(id),
  findBySlug: (slug: string) => StoreModel.findOne({ slug })
};

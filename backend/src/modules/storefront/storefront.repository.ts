import { StoreModel } from '../stores/stores.model.js';

export const storefrontRepository = {
  findBySlug: (slug: string) => StoreModel.findOne({ slug })
};

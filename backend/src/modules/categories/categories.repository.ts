import { CategoryModel } from './categories.model.js';

export const categoriesRepository = {
  findForStore: (storeId: string) => CategoryModel.find({ storeId })
};

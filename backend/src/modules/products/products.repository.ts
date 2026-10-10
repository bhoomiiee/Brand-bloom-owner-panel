import { ProductModel } from './products.model.js';

export const productsRepository = {
  findById: (storeId: string, id: string) => ProductModel.findOne({ _id: id, storeId })
};

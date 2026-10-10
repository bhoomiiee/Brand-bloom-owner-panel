import { InventoryModel } from './inventory.model.js';

export const inventoryRepository = {
  findByVariant: (storeId: string, variantId: string) => InventoryModel.findOne({ storeId, variantId })
};

import { InventoryModel } from '../inventory/inventory.model.js';

export const lowStockService = {
  async getLowStockItems(storeId: string) {
    return InventoryModel.find({
      storeId,
      $expr: { $lte: ['$onHand', '$lowStockThreshold'] }
    }).populate('variantId');
  }
};

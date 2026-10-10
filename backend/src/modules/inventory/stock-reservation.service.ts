import { InventoryModel } from './inventory.model.js';

export const stockReservationService = {
  async reserve(storeId: string, variantId: string, qty: number): Promise<boolean> {
    const res = await InventoryModel.updateOne(
      { storeId, variantId, $expr: { $gte: [{ $subtract: ['$onHand', '$reserved'] }, qty] } },
      { $inc: { reserved: qty } }
    );
    return res.modifiedCount > 0;
  },

  async release(storeId: string, variantId: string, qty: number): Promise<void> {
    await InventoryModel.updateOne(
      { storeId, variantId },
      { $inc: { reserved: -qty } }
    );
  }
};

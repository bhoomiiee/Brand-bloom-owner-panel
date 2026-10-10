import mongoose from 'mongoose';
import { InventoryModel } from '../../inventory/inventory.model.js';

export async function lowStockQuery(storeId: string) {
  const storeObjId = new mongoose.Types.ObjectId(storeId);
  const lowStock = await InventoryModel.find({
    storeId: storeObjId,
    $expr: { $lte: ['$onHand', '$lowStockThreshold'] }
  }).populate('variantId');
  return { lowStockCount: lowStock.length, items: lowStock };
}

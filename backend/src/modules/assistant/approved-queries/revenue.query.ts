import mongoose from 'mongoose';
import { OrderModel } from '../../orders/orders.model.js';

export async function revenueQuery(storeId: string) {
  const storeObjId = new mongoose.Types.ObjectId(storeId);
  const agg = await OrderModel.aggregate([
    { $match: { storeId: storeObjId, status: { $in: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'] } } },
    { $group: { _id: null, totalCents: { $sum: '$totalCents' } } }
  ]);
  return { revenueCents: agg[0]?.totalCents || 0 };
}

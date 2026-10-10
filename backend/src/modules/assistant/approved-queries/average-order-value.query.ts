import mongoose from 'mongoose';
import { OrderModel } from '../../orders/orders.model.js';

export async function averageOrderValueQuery(storeId: string) {
  const storeObjId = new mongoose.Types.ObjectId(storeId);
  const agg = await OrderModel.aggregate([
    { $match: { storeId: storeObjId, status: { $in: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'] } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalCents' }, orderCount: { $sum: 1 } } }
  ]);
  const totalRevenue = agg[0]?.totalRevenue || 0;
  const orderCount = agg[0]?.orderCount || 0;
  const aovCents = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;
  return { averageOrderValueCents: aovCents, orderCount, totalRevenueCents: totalRevenue };
}

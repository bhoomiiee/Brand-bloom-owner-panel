import mongoose from 'mongoose';
import { OrderModel } from '../../orders/orders.model.js';

export async function salesByProductQuery(storeId: string) {
  const storeObjId = new mongoose.Types.ObjectId(storeId);
  const items = await OrderModel.aggregate([
    { $match: { storeId: storeObjId, status: { $in: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.title', unitsSold: { $sum: '$items.quantity' } } },
    { $sort: { unitsSold: -1 } },
    { $limit: 5 }
  ]);
  return { topProducts: items };
}

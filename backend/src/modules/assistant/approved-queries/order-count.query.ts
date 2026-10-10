import mongoose from 'mongoose';
import { OrderModel } from '../../orders/orders.model.js';

export async function orderCountQuery(storeId: string) {
  const storeObjId = new mongoose.Types.ObjectId(storeId);
  const count = await OrderModel.countDocuments({
    storeId: storeObjId,
    status: { $in: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'] }
  });
  return { orderCount: count };
}

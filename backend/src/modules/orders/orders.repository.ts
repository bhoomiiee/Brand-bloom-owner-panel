import { OrderModel } from './orders.model.js';

export const ordersRepository = {
  findById: (storeId: string, id: string) => OrderModel.findOne({ _id: id, storeId })
};

import { OrderModel } from '../orders/orders.model.js';

export const analyticsRepository = {
  findStoreOrders: (storeId: string) => OrderModel.find({ storeId })
};

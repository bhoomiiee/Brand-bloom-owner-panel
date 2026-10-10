import { OrderModel } from '../orders/orders.model.js';
import { InventoryModel } from '../inventory/inventory.model.js';
import mongoose from 'mongoose';

export const analyticsService = {
  async getDashboardMetrics(storeId: string, _query: any) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const revenueAgg = await OrderModel.aggregate([
      { $match: { storeId: storeObjId, status: { $in: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalCents' }, orderCount: { $sum: 1 } } }
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const orderCount = revenueAgg[0]?.orderCount || 0;
    const aov = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    const lowStockCount = await InventoryModel.countDocuments({
      storeId: storeObjId,
      $expr: { $lte: ['$onHand', '$lowStockThreshold'] }
    });

    const recentOrders = await OrderModel.find({ storeId: storeObjId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalCents status customerEmail createdAt');

    return {
      revenueCents: totalRevenue,
      paidOrderCount: orderCount,
      averageOrderValueCents: aov,
      lowStockCount,
      recentOrders
    };
  },

  async getSalesByProduct(storeId: string, _query: any) {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    return OrderModel.aggregate([
      { $match: { storeId: storeObjId, status: { $in: ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.title', totalSold: { $sum: '$items.quantity' }, revenueCents: { $sum: { $multiply: ['$items.priceCents', '$items.quantity'] } } } },
      { $sort: { revenueCents: -1 } },
      { $limit: 10 }
    ]);
  }
};

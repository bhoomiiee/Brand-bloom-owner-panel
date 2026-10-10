import { OrderModel } from './orders.model.js';
import { OrderEventModel } from './order-event.model.js';
import { assertValidTransition } from './order-state-machine.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { buildPaginationMeta } from '../../shared/http/pagination.js';

import { inventoryService } from '../inventory/inventory.service.js';
import { auditService } from '../audit/audit.service.js';
import { StoreModel } from '../stores/stores.model.js';
import { emailService } from '../email/email.service.js';

export const ordersService = {
  async list(storeId: string, pagination: any, filters: any) {
    const query: any = { storeId };
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { orderNumber: { $regex: filters.search, $options: 'i' } },
        { customerEmail: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const total = await OrderModel.countDocuments(query);
    const items = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return { items, meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  },

  async getById(storeId: string, id: string) {
    const order = await OrderModel.findOne({ _id: id, storeId });
    if (!order) throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
    const events = await OrderEventModel.find({ orderId: order._id }).sort({ createdAt: 1 });
    return { order, events };
  },

  async getByOrderNumber(storeId: string, orderNumber: string) {
    const order = await OrderModel.findOne({ orderNumber, storeId });
    if (!order) throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);
    const events = await OrderEventModel.find({ orderId: order._id }).sort({ createdAt: 1 });
    return { order, events };
  },

  async createOrder(data: any) {
    const orderNumber = data.orderNumber || `ORD-${Date.now().toString().slice(-6)}`;
    const status = data.status || 'PAID';
    const order = await OrderModel.create({
      ...data,
      orderNumber,
      status
    });

    await OrderEventModel.create({
      orderId: order._id,
      fromStatus: 'PENDING',
      toStatus: status,
      actor: 'customer'
    });

    await auditService.record(data.storeId.toString(), '000000000000000000000000', 'ORDER_CREATED', {
      orderNumber,
      totalCents: data.totalCents
    });

    return order;
  },

  async transitionStatus(storeId: string, id: string, newStatus: string, actorId: string) {
    const order = await OrderModel.findOne({ _id: id, storeId });
    if (!order) throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND);

    assertValidTransition(order.status, newStatus);
    const prev = order.status;
    order.status = newStatus as any;
    await order.save();

    await OrderEventModel.create({
      orderId: order._id,
      fromStatus: prev,
      toStatus: newStatus,
      actor: actorId
    });

    // If order is cancelled or refunded, restore stock for the inventory ledger
    if (['CANCELLED', 'REFUNDED'].includes(newStatus) && ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'].includes(prev)) {
      const itemsToRestore = order.items.map(item => ({
        variantId: item.variantId.toString(),
        quantity: item.quantity
      }));
      await inventoryService.releaseStockForOrder(storeId, itemsToRestore, order.orderNumber);
    }

    await auditService.record(storeId, actorId, 'ORDER_STATUS_CHANGED', {
      orderNumber: order.orderNumber,
      from: prev,
      to: newStatus
    });

    // Send order status update email to customer via Resend
    try {
      const storeDoc = await StoreModel.findById(storeId);
      await emailService.sendOrderStatusUpdate({
        to: order.customerEmail,
        storeName: storeDoc?.name || 'Brand Bloom Store',
        orderNumber: order.orderNumber,
        newStatus,
        prevStatus: prev
      });
    } catch (err: any) {
      console.warn(`[ORDERS] Status update email delivery notice: ${err.message}`);
    }

    return order;
  }
};

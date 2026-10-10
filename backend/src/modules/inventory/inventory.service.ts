import { InventoryModel } from './inventory.model.js';
import { InventoryMovementModel } from './inventory-movement.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const inventoryService = {
  async listByStore(storeId: string) {
    return InventoryModel.find({ storeId }).populate('variantId');
  },

  async adjustStock(storeId: string, data: { variantId: string; delta: number; reason: string }, actorId?: string) {
    if (!Number.isInteger(data.delta) || data.delta === 0) {
      throw new AppError('Stock adjustment delta must be a non-zero integer', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    let updated;
    if (data.delta < 0) {
      updated = await InventoryModel.findOneAndUpdate(
        { storeId, variantId: data.variantId, onHand: { $gte: Math.abs(data.delta) } },
        { $inc: { onHand: data.delta } },
        { new: true }
      );
      if (!updated) {
        throw new AppError('Insufficient inventory to deduct stock', 400, ERROR_CODES.VALIDATION_ERROR);
      }
    } else {
      updated = await InventoryModel.findOneAndUpdate(
        { storeId, variantId: data.variantId },
        { $inc: { onHand: data.delta } },
        { new: true }
      );
      if (!updated) {
        throw new AppError('Inventory record not found', 404, ERROR_CODES.NOT_FOUND);
      }
    }

    await InventoryMovementModel.create({
      storeId,
      variantId: data.variantId,
      delta: data.delta,
      balanceAfter: updated.onHand,
      type: data.delta > 0 ? 'ADJUST_UP' : 'ADJUST_DOWN',
      reason: data.reason || 'Manual Adjustment',
      performedBy: actorId || null
    });

    return { ...updated.toObject(), currentOnHand: updated.onHand };
  },

  async deductStockForOrder(storeId: string, items: Array<{ variantId: string; quantity: number }>, orderNumber: string) {
    const deducted: Array<{ variantId: string; quantity: number }> = [];

    for (const item of items) {
      const updated = await InventoryModel.findOneAndUpdate(
        { storeId, variantId: item.variantId, onHand: { $gte: item.quantity } },
        { $inc: { onHand: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        // Compensating rollback for any items already deducted in this request
        for (const rolled of deducted) {
          await InventoryModel.findOneAndUpdate(
            { storeId, variantId: rolled.variantId },
            { $inc: { onHand: rolled.quantity } }
          );
        }
        throw new AppError(`Insufficient stock for variant ${item.variantId}`, 409, ERROR_CODES.CONFLICT);
      }

      deducted.push(item);
      await InventoryMovementModel.create({
        storeId,
        variantId: item.variantId,
        delta: -item.quantity,
        balanceAfter: updated.onHand,
        type: 'SALE',
        reason: `Order ${orderNumber}`
      });
    }
  },

  async releaseStockForOrder(storeId: string, items: Array<{ variantId: string; quantity: number }>, orderNumber: string) {
    for (const item of items) {
      const updated = await InventoryModel.findOneAndUpdate(
        { storeId, variantId: item.variantId },
        { $inc: { onHand: item.quantity } },
        { new: true }
      );

      if (updated) {
        await InventoryMovementModel.create({
          storeId,
          variantId: item.variantId,
          delta: item.quantity,
          balanceAfter: updated.onHand,
          type: 'RESTORE',
          reason: `Restoration for ${orderNumber}`
        });
      }
    }
  },

  async getLowStockItems(storeId: string) {
    return InventoryModel.find({
      storeId,
      $expr: { $lte: ['$onHand', '$lowStockThreshold'] }
    }).populate('variantId');
  },

  async getHistory(storeId: string, variantId: string) {
    return InventoryMovementModel.find({ storeId, variantId }).sort({ createdAt: -1 }).limit(50);
  }
};

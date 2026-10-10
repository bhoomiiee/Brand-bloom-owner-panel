import mongoose from 'mongoose';
import { ProductModel } from '../products/products.model.js';
import { ProductVariantModel } from '../products/product-variants.model.js';
import { InventoryModel } from '../inventory/inventory.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { ordersService } from '../orders/orders.service.js';
import { notificationsService } from '../notifications/notifications.service.js';
import { CustomerModel } from '../customers/customers.model.js';
import { promotionsService } from '../marketing/promotions.service.js';
import { StoreModel } from '../stores/stores.model.js';
import { emailService } from '../email/email.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const checkoutService = {
  async calculate(data: {
    storeId: string;
    items: Array<{ variantId: string; quantity: number }>;
    shippingAddress?: any;
    promotionCode?: string;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new AppError('Checkout items array cannot be empty', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const snapshotItems: Array<{
      variantId: any;
      title: string;
      sku: string;
      quantity: number;
      priceCents: number;
    }> = [];

    let subtotalCents = 0;

    for (const item of data.items) {
      if (!item.quantity || item.quantity < 1) {
        throw new AppError('Item quantity must be at least 1', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      const variant = await ProductVariantModel.findOne({ _id: item.variantId, storeId: data.storeId });
      if (!variant) {
        throw new AppError(`Variant not found: ${item.variantId}`, 404, ERROR_CODES.NOT_FOUND);
      }

      const product = await ProductModel.findOne({
        _id: variant.productId,
        storeId: data.storeId,
        isArchived: false,
        status: 'ACTIVE'
      });
      if (!product) {
        throw new AppError(`Product is no longer available: ${variant.title}`, 400, ERROR_CODES.VALIDATION_ERROR);
      }

      const inv = await InventoryModel.findOne({ storeId: data.storeId, variantId: variant._id });
      if (!inv || inv.onHand < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.title}"`, 409, ERROR_CODES.CONFLICT);
      }

      const linePrice = variant.priceCents;
      subtotalCents += linePrice * item.quantity;

      snapshotItems.push({
        variantId: variant._id,
        title: product.title,
        sku: variant.sku,
        quantity: item.quantity,
        priceCents: linePrice
      });
    }

    // Apply promotion discount if provided
    let discountCents = 0;
    let appliedPromoCode: string | undefined;
    let promoMessage: string | undefined;

    if (data.promotionCode && data.promotionCode.trim()) {
      const promoResult = await promotionsService.validateAndApply(
        data.storeId,
        data.promotionCode.trim(),
        subtotalCents
      );
      if (promoResult.valid) {
        discountCents = promoResult.discountCents;
        appliedPromoCode = promoResult.code;
        promoMessage = promoResult.message;
      } else {
        promoMessage = promoResult.message;
      }
    }

    const discountedSubtotal = Math.max(0, subtotalCents - discountCents);
    const shippingCents = discountedSubtotal >= 10000 ? 0 : 999;
    const taxCents = Math.round(discountedSubtotal * 0.08); // 8% documented tax rate
    const totalCents = discountedSubtotal + taxCents + shippingCents;

    return {
      items: snapshotItems,
      subtotalCents,
      discountCents,
      discountCode: appliedPromoCode,
      promoMessage,
      taxCents,
      shippingCents,
      totalCents
    };
  },

  async submit(data: {
    storeId: string;
    customerEmail: string;
    customerId?: string;
    promotionCode?: string;
    items: Array<{ variantId: string; quantity: number }>;
    shippingAddress?: any;
  }) {
    if (!data.customerEmail) {
      throw new AppError('Customer email is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const normalizedEmail = data.customerEmail.trim().toLowerCase();
    const totals = await this.calculate({
      storeId: data.storeId,
      items: data.items,
      shippingAddress: data.shippingAddress,
      promotionCode: data.promotionCode
    });
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Resolve customerId if explicitly provided by authenticated customer
    let customerObjId: mongoose.Types.ObjectId | undefined;
    if (data.customerId && mongoose.Types.ObjectId.isValid(data.customerId)) {
      customerObjId = new mongoose.Types.ObjectId(data.customerId);
    }

    // Atomically decrement stock
    await inventoryService.deductStockForOrder(
      data.storeId,
      data.items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
      orderNumber
    );

    const order = await ordersService.createOrder({
      storeId: data.storeId,
      customerId: customerObjId ? customerObjId.toString() : undefined,
      orderNumber,
      customerEmail: normalizedEmail,
      items: totals.items,
      shippingAddress: data.shippingAddress || {
        fullName: 'Customer',
        street: '123 Main St',
        city: 'Metropolis',
        country: 'US',
        postalCode: '10001'
      },
      subtotalCents: totals.subtotalCents,
      discountCents: totals.discountCents,
      discountCode: totals.discountCode,
      taxCents: totals.taxCents,
      shippingCents: totals.shippingCents,
      totalCents: totals.totalCents,
      status: 'PAID'
    });

    // Update customer spend & order metrics if customer exists
    if (customerObjId) {
      await CustomerModel.updateOne(
        { _id: customerObjId },
        {
          $inc: { totalOrdersCount: 1, totalSpendCents: totals.totalCents },
          $set: { lastOrderAt: new Date() }
        }
      );
    }

    // Increment promotion code usage count if a valid discount was applied
    if (totals.discountCode) {
      await promotionsService.incrementUsage(data.storeId, totals.discountCode);
    }

    await notificationsService.createNotification(
      data.storeId,
      `New order #${orderNumber}`,
      `Received payment for order #${orderNumber} totaling $${(totals.totalCents / 100).toFixed(2)}.`
    );

    // Send customer order confirmation email via Resend
    try {
      const storeDoc = await StoreModel.findById(data.storeId);
      await emailService.sendOrderConfirmation({
        to: normalizedEmail,
        storeName: storeDoc?.name || 'Brand Bloom Store',
        orderNumber,
        items: totals.items,
        subtotalCents: totals.subtotalCents,
        discountCents: totals.discountCents,
        discountCode: totals.discountCode,
        taxCents: totals.taxCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        shippingAddress: data.shippingAddress
      });
    } catch (err: any) {
      console.warn(`[CHECKOUT] Order confirmation email delivery notice: ${err.message}`);
    }

    return order;
  }
};

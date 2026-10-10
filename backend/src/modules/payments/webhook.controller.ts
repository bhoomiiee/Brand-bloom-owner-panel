import { Request, Response } from 'express';
import { webhookVerificationService } from './webhook-verification.service.js';
import { PaymentAttemptModel } from './payments.model.js';
import { OrderModel } from '../orders/orders.model.js';
import { ordersService } from '../orders/orders.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const webhookController = {
  handleWebhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = (req.headers['x-webhook-signature'] || req.headers['stripe-signature']) as string;
    const isValid = webhookVerificationService.verifySignature(req.body, signature);

    if (!isValid) {
      throw new AppError('Invalid webhook signature', 401, ERROR_CODES.UNAUTHORIZED);
    }

    const { eventId, type, data } = req.body;
    if (!eventId) {
      throw new AppError('Missing eventId in webhook payload', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // Idempotency check: see if this providerTransactionId has already succeeded
    const existingAttempt = await PaymentAttemptModel.findOne({ providerTransactionId: eventId });
    if (existingAttempt) {
      return res.json({ received: true, deduplicated: true });
    }

    if (type === 'payment_intent.succeeded') {
      const order = await OrderModel.findById(data.orderId);
      if (!order) {
        throw new AppError('Order not found for payment webhook', 404, ERROR_CODES.NOT_FOUND);
      }

      // Check amount matching
      if (data.amountCents && order.totalCents !== data.amountCents) {
        throw new AppError('Payment amount mismatch', 400, ERROR_CODES.VALIDATION_ERROR);
      }

      if (order.status !== 'PAID') {
        await ordersService.transitionStatus(order.storeId.toString(), order._id.toString(), 'PAID', 'webhook-provider');
      }

      await PaymentAttemptModel.create({
        orderId: order._id,
        storeId: order.storeId,
        amountCents: order.totalCents,
        provider: 'stripe-simulated',
        providerTransactionId: eventId,
        status: 'SUCCESS'
      });
    } else if (type === 'payment_intent.failed') {
      const order = await OrderModel.findById(data.orderId);
      if (order && order.status !== 'CANCELLED') {
        await ordersService.transitionStatus(order.storeId.toString(), order._id.toString(), 'CANCELLED', 'webhook-provider');
      }

      if (order) {
        await PaymentAttemptModel.create({
          orderId: order._id,
          storeId: order.storeId,
          amountCents: order.totalCents,
          provider: 'stripe-simulated',
          providerTransactionId: eventId,
          status: 'FAILED'
        });
      }
    }

    res.json({ received: true });
  })
};

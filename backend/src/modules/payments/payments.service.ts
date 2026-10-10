import { PaymentAttemptModel } from './payments.model.js';

export const paymentsService = {
  async createPaymentIntent(data: { orderId: string; storeId: string; amountCents: number }) {
    return PaymentAttemptModel.create({
      orderId: data.orderId,
      storeId: data.storeId,
      amountCents: data.amountCents,
      provider: 'stripe-mock',
      status: 'INITIATED'
    });
  }
};

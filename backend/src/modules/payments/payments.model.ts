import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentAttempt extends Document {
  orderId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  amountCents: number;
  provider: string;
  providerTransactionId?: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED';
}

const PaymentAttemptSchema = new Schema<IPaymentAttempt>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  amountCents: { type: Number, required: true },
  provider: { type: String, default: 'stripe' },
  providerTransactionId: { type: String },
  status: { type: String, enum: ['INITIATED', 'SUCCESS', 'FAILED'], default: 'INITIATED' }
}, { timestamps: true });

export const PaymentAttemptModel = mongoose.model<IPaymentAttempt>('PaymentAttempt', PaymentAttemptSchema);

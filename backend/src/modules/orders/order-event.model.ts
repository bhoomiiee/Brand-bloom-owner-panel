import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderEvent extends Document {
  orderId: mongoose.Types.ObjectId;
  fromStatus: string;
  toStatus: string;
  actor: string;
  note?: string;
  createdAt: Date;
}

const OrderEventSchema = new Schema<IOrderEvent>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  actor: { type: String, default: 'system' },
  note: { type: String }
}, { timestamps: true });

export const OrderEventModel = mongoose.model<IOrderEvent>('OrderEvent', OrderEventSchema);

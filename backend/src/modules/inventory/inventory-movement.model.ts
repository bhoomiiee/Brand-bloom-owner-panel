import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryMovement extends Document {
  storeId: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;
  delta: number;
  balanceAfter: number;
  type: string;
  reason?: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  delta: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  type: { type: String, required: true },
  reason: { type: String },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

InventoryMovementSchema.index({ storeId: 1, variantId: 1, createdAt: -1 });

export const InventoryMovementModel = mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);

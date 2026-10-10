import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  storeId: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;
  onHand: number;
  reserved: number;
  lowStockThreshold: number;
}

const InventorySchema = new Schema<IInventory>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true, index: true },
  onHand: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 }
}, { timestamps: true });

InventorySchema.index({ storeId: 1, variantId: 1 }, { unique: true });

export const InventoryModel = mongoose.model<IInventory>('Inventory', InventorySchema);

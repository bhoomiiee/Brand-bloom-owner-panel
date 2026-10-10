import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  variantId: mongoose.Types.ObjectId;
  quantity: number;
  priceCents: number;
}

export interface ICart extends Document {
  storeId: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  items: [{
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceCents: { type: Number, required: true }
  }]
}, { timestamps: true });

export const CartModel = mongoose.model<ICart>('Cart', CartSchema);

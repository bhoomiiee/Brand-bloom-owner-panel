import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant extends Document {
  storeId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sku: string;
  title: string;
  priceCents: number;
  barcode?: string;
  attributes: Record<string, string>;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  sku: { type: String, required: true },
  title: { type: String, required: true },
  priceCents: { type: Number, required: true },
  barcode: { type: String },
  attributes: { type: Map, of: String, default: {} }
}, { timestamps: true });

ProductVariantSchema.index({ storeId: 1, sku: 1 }, { unique: true });

export const ProductVariantModel = mongoose.model<IProductVariant>('ProductVariant', ProductVariantSchema);

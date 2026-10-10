import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  categoryId?: mongoose.Types.ObjectId;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  basePriceCents: number;
  compareAtPriceCents?: number;
  images: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'DRAFT' },
  basePriceCents: { type: Number, required: true },
  compareAtPriceCents: { type: Number },
  images: [{ type: String }],
  isArchived: { type: Boolean, default: false, index: true }
}, { timestamps: true });

ProductSchema.index({ storeId: 1, slug: 1 });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

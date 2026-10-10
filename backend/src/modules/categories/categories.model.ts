import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  order: number;
}

const CategorySchema = new Schema<ICategory>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  order: { type: Number, default: 0 }
}, { timestamps: true });

CategorySchema.index({ storeId: 1, slug: 1 }, { unique: true });

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);

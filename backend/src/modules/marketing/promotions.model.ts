import mongoose, { Schema, Document } from 'mongoose';

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface IPromotion extends Document {
  storeId: mongoose.Types.ObjectId;
  code: string;
  description?: string;
  type: PromotionType;
  value: number; // e.g. 15 for 15% or 1000 for $10.00 off
  minSubtotalCents: number;
  maxDiscountCents?: number;
  usageLimit?: number;
  usageCount: number;
  startsAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
  value: { type: Number, required: true, min: 1 },
  minSubtotalCents: { type: Number, default: 0, min: 0 },
  maxDiscountCents: { type: Number },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  startsAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

PromotionSchema.index({ storeId: 1, code: 1 }, { unique: true });

export const PromotionModel = mongoose.model<IPromotion>('Promotion', PromotionSchema);

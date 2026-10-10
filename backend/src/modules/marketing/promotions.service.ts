import mongoose from 'mongoose';
import { PromotionModel, IPromotion, PromotionType } from './promotions.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export interface PromotionValidationResult {
  valid: boolean;
  code: string;
  type?: PromotionType;
  value?: number;
  discountCents: number;
  message?: string;
}

export const promotionsService = {
  async validateAndApply(storeId: string, rawCode: string, subtotalCents: number): Promise<PromotionValidationResult> {
    if (!rawCode || typeof rawCode !== 'string') {
      return { valid: false, code: '', discountCents: 0, message: 'Invalid promotion code' };
    }

    const code = rawCode.trim().toUpperCase();
    const storeObjId = new mongoose.Types.ObjectId(storeId);

    const promo = await PromotionModel.findOne({ storeId: storeObjId, code, isActive: true });
    if (!promo) {
      return { valid: false, code, discountCents: 0, message: `Promo code "${code}" is invalid or inactive` };
    }

    const now = new Date();
    if (promo.startsAt && promo.startsAt > now) {
      return { valid: false, code, discountCents: 0, message: `Promo code "${code}" is not yet active` };
    }

    if (promo.expiresAt && promo.expiresAt < now) {
      return { valid: false, code, discountCents: 0, message: `Promo code "${code}" has expired` };
    }

    if (promo.usageLimit !== undefined && promo.usageCount >= promo.usageLimit) {
      return { valid: false, code, discountCents: 0, message: `Promo code "${code}" usage limit has been reached` };
    }

    if (subtotalCents < promo.minSubtotalCents) {
      const minDollars = (promo.minSubtotalCents / 100).toFixed(2);
      return {
        valid: false,
        code,
        discountCents: 0,
        message: `Minimum order subtotal of $${minDollars} required to apply "${code}"`
      };
    }

    let discountCents = 0;
    if (promo.type === 'PERCENTAGE') {
      discountCents = Math.round((subtotalCents * promo.value) / 100);
      if (promo.maxDiscountCents && discountCents > promo.maxDiscountCents) {
        discountCents = promo.maxDiscountCents;
      }
    } else if (promo.type === 'FIXED_AMOUNT') {
      discountCents = promo.value; // value stored in cents
    }

    // Ensure discount does not exceed subtotal
    discountCents = Math.min(discountCents, subtotalCents);

    return {
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discountCents,
      message: `Promo code "${promo.code}" applied!`
    };
  },

  async incrementUsage(storeId: string, code: string): Promise<void> {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    await PromotionModel.updateOne(
      { storeId: storeObjId, code: code.trim().toUpperCase() },
      { $inc: { usageCount: 1 } }
    );
  },

  async listPromotions(storeId: string): Promise<IPromotion[]> {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    return PromotionModel.find({ storeId: storeObjId }).sort({ createdAt: -1 });
  },

  async createPromotion(storeId: string, data: {
    code: string;
    description?: string;
    type: PromotionType;
    value: number;
    minSubtotalCents?: number;
    maxDiscountCents?: number;
    usageLimit?: number;
    startsAt?: Date;
    expiresAt?: Date;
    isActive?: boolean;
  }): Promise<IPromotion> {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const code = data.code.trim().toUpperCase();

    const existing = await PromotionModel.findOne({ storeId: storeObjId, code });
    if (existing) {
      throw new AppError(`Promotion code "${code}" already exists for this store`, 409, ERROR_CODES.CONFLICT);
    }

    return PromotionModel.create({
      storeId: storeObjId,
      code,
      description: data.description || '',
      type: data.type,
      value: Number(data.value),
      minSubtotalCents: Number(data.minSubtotalCents || 0),
      maxDiscountCents: data.maxDiscountCents ? Number(data.maxDiscountCents) : undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      startsAt: data.startsAt || new Date(),
      expiresAt: data.expiresAt,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  },

  async updatePromotion(storeId: string, promotionId: string, data: Partial<IPromotion>): Promise<IPromotion> {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const updated = await PromotionModel.findOneAndUpdate(
      { _id: promotionId, storeId: storeObjId },
      { $set: data },
      { new: true }
    );

    if (!updated) {
      throw new AppError('Promotion not found', 404, ERROR_CODES.NOT_FOUND);
    }

    return updated;
  },

  async deletePromotion(storeId: string, promotionId: string): Promise<void> {
    const storeObjId = new mongoose.Types.ObjectId(storeId);
    const res = await PromotionModel.deleteOne({ _id: promotionId, storeId: storeObjId });
    if (res.deletedCount === 0) {
      throw new AppError('Promotion not found', 404, ERROR_CODES.NOT_FOUND);
    }
  }
};

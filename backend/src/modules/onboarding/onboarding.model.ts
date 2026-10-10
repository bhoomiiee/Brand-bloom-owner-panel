import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingDraft extends Document {
  userId: mongoose.Types.ObjectId;
  storeName?: string;
  businessType?: string;
  currency?: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  step: number;
}

const OnboardingDraftSchema = new Schema<IOnboardingDraft>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeName: { type: String },
  businessType: { type: String },
  currency: { type: String, default: 'USD' },
  address: {
    street: String,
    city: String,
    country: String
  },
  step: { type: Number, default: 1 }
}, { timestamps: true });

export const OnboardingDraftModel = mongoose.model<IOnboardingDraft>('OnboardingDraft', OnboardingDraftSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IStoreSettings {
  currency: string;
  timezone: string;
  taxRatePercentage: number;
}

export interface IStore extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  businessType: string;
  address: IStoreAddress;
  logoUrl?: string;
  settings: IStoreSettings;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  businessType: {
    type: String,
    required: true,
    trim: true,
    default: 'retail'
  },
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'US' }
  },
  logoUrl: {
    type: String,
    trim: true
  },
  settings: {
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    timezone: { type: String, default: 'UTC', trim: true },
    taxRatePercentage: { type: Number, default: 0, min: 0, max: 100 }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any).__v;
      return ret;
    }
  }
});

export const StoreModel = mongoose.model<IStore>('Store', StoreSchema);

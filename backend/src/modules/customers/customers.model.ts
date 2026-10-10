import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerAddress {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface IMarketingConsent {
  emailOptIn: boolean;
  optInSource: string;
  optInTimestamp?: Date;
  optOutTimestamp?: Date;
}

export interface ICustomer extends Document {
  storeId: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: ICustomerAddress[];
  marketingConsent: IMarketingConsent;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerified: boolean;
  status: 'ACTIVE' | 'BLOCKED';
  totalOrdersCount: number;
  totalSpendCents: number;
  lastOrderAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerAddressSchema = new Schema<ICustomerAddress>({
  id: { type: String, required: true },
  fullName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  country: { type: String, required: true, default: 'US' },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const CustomerSchema = new Schema<ICustomer>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, default: '', trim: true },
  lastName: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  addresses: [CustomerAddressSchema],
  marketingConsent: {
    emailOptIn: { type: Boolean, default: false },
    optInSource: { type: String, default: 'storefront_registration' },
    optInTimestamp: { type: Date },
    optOutTimestamp: { type: Date }
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  emailVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'BLOCKED'], default: 'ACTIVE', index: true },
  totalOrdersCount: { type: Number, default: 0 },
  totalSpendCents: { type: Number, default: 0 },
  lastOrderAt: { type: Date }
}, { timestamps: true });

// Compound unique index ensuring one account per email within each store tenant
CustomerSchema.index({ storeId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ storeId: 1, totalSpendCents: -1 });
CustomerSchema.index({ storeId: 1, totalOrdersCount: -1 });
CustomerSchema.index({ storeId: 1, createdAt: -1 });

export const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema);

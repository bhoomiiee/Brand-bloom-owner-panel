import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  variantId: mongoose.Types.ObjectId;
  title: string;
  quantity: number;
  priceCents: number;
}

export interface IOrder extends Document {
  storeId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  orderNumber: string;
  customerEmail: string;
  items: IOrderItem[];
  subtotalCents: number;
  discountCents?: number;
  discountCode?: string;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  status: 'PENDING' | 'PAYMENT_PROCESSING' | 'PAID' | 'PROCESSING' | 'FULFILLED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
  orderNumber: { type: String, required: true, unique: true },
  customerEmail: { type: String, required: true, index: true },
  items: [{
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceCents: { type: Number, required: true }
  }],
  subtotalCents: { type: Number, required: true },
  discountCents: { type: Number, default: 0 },
  discountCode: { type: String },
  taxCents: { type: Number, default: 0 },
  shippingCents: { type: Number, default: 0 },
  totalCents: { type: Number, required: true },
  status: { type: String, default: 'PENDING', index: true },
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    country: String,
    postalCode: String
  }
}, { timestamps: true });

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);

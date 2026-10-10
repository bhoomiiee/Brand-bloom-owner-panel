import mongoose, { Schema, Document } from 'mongoose';

export interface IConsentLog extends Document {
  storeId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  email: string;
  channel: 'EMAIL' | 'SMS';
  action: 'OPT_IN' | 'OPT_OUT' | 'UNSUBSCRIBE';
  source: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ConsentLogSchema = new Schema<IConsentLog>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  channel: { type: String, enum: ['EMAIL', 'SMS'], default: 'EMAIL' },
  action: { type: String, enum: ['OPT_IN', 'OPT_OUT', 'UNSUBSCRIBE'], required: true },
  source: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

ConsentLogSchema.index({ storeId: 1, email: 1, createdAt: -1 });

export const ConsentLogModel = mongoose.model<IConsentLog>('ConsentLog', ConsentLogSchema);

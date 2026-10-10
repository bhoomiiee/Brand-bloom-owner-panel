import mongoose, { Schema, Document } from 'mongoose';

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
export type CampaignTargetSegment = 'all' | 'new' | 'repeat' | 'high_value' | 'inactive';

export interface ICampaignRecipientLog {
  email: string;
  status: 'DELIVERED' | 'FAILED';
  error?: string;
  sentAt: Date;
}

export interface ICampaign extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  contentHtml: string;
  contentText: string;
  targetSegment: CampaignTargetSegment;
  promotionCode?: string;
  status: CampaignStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  stats: {
    recipientsCount: number;
    deliveredCount: number;
    failedCount: number;
    ordersAttributedCount: number;
    revenueAttributedCents: number;
  };
  recipientLogs: ICampaignRecipientLog[];
  createdAt: Date;
  updatedAt: Date;
}

const CampaignRecipientLogSchema = new Schema<ICampaignRecipientLog>({
  email: { type: String, required: true },
  status: { type: String, enum: ['DELIVERED', 'FAILED'], required: true },
  error: { type: String },
  sentAt: { type: Date, default: Date.now }
}, { _id: false });

const CampaignSchema = new Schema<ICampaign>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  contentHtml: { type: String, required: true },
  contentText: { type: String, default: '' },
  targetSegment: {
    type: String,
    enum: ['all', 'new', 'repeat', 'high_value', 'inactive', 'ALL_OPTED_IN', 'NEW_CUSTOMERS', 'REPEAT_CUSTOMERS', 'HIGH_VALUE', 'INACTIVE'],
    default: 'all',
    index: true
  },
  promotionCode: { type: String, uppercase: true, trim: true },
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED'],
    default: 'DRAFT',
    index: true
  },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  stats: {
    recipientsCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    ordersAttributedCount: { type: Number, default: 0 },
    revenueAttributedCents: { type: Number, default: 0 }
  },
  recipientLogs: [CampaignRecipientLogSchema]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

CampaignSchema.virtual('metrics').get(function() {
  return {
    totalTargeted: this.stats?.recipientsCount || 0,
    sentCount: this.stats?.deliveredCount || 0,
    deliveredCount: this.stats?.deliveredCount || 0,
    openedCount: 0,
    clickedCount: 0,
    unsubscribedCount: 0,
    attributedOrdersCount: this.stats?.ordersAttributedCount || 0,
    attributedRevenueCents: this.stats?.revenueAttributedCents || 0
  };
});

CampaignSchema.index({ storeId: 1, createdAt: -1 });

export const CampaignModel = mongoose.model<ICampaign>('Campaign', CampaignSchema);

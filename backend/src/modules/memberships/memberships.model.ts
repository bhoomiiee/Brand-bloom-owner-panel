import mongoose, { Schema, Document } from 'mongoose';

export type MembershipRole = 'owner' | 'staff';
export type MembershipStatus = 'active' | 'suspended';

export interface IStoreMembership extends Document {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: MembershipRole;
  status: MembershipStatus;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StoreMembershipSchema = new Schema<IStoreMembership>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['owner', 'staff'],
    required: true,
    default: 'staff'
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
    index: true
  },
  permissions: {
    type: [String],
    default: []
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

// Enforce unique compound index on { storeId, userId }
StoreMembershipSchema.index({ storeId: 1, userId: 1 }, { unique: true });
StoreMembershipSchema.index({ userId: 1, status: 1 });
StoreMembershipSchema.index({ storeId: 1, status: 1 });

export const StoreMembershipModel = mongoose.model<IStoreMembership>('StoreMembership', StoreMembershipSchema);

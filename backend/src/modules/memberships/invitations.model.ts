import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
  storeId: mongoose.Types.ObjectId;
  email: string;
  role: string;
  permissions: string[];
  token: string;
  expiresAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  permissions: [{ type: String }],
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export const InvitationModel = mongoose.model<IInvitation>('Invitation', InvitationSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  storeId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  action: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

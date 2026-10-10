import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  storeId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'INFO' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);

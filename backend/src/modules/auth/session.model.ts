import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Automatic MongoDB TTL deletion when expiresAt is reached
  }
}, {
  timestamps: true
});

export const SessionModel = mongoose.model<ISession>('Session', SessionSchema);

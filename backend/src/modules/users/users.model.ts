import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): SafeUser;
}

export interface SafeUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false // Excluded by default in queries
  },
  avatarUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete (ret as any).passwordHash;
      delete (ret as any).__v;
      return ret;
    }
  }
});

UserSchema.methods.toSafeObject = function (): SafeUser {
  const idStr = this._id.toString();
  return {
    id: idStr,
    userId: idStr,
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString()
  };
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);

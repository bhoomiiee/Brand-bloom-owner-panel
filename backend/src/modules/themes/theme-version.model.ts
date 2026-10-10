import mongoose, { Schema, Document } from 'mongoose';

export interface IThemeVersion extends Document {
  storeId: mongoose.Types.ObjectId;
  version: number;
  configSnapshot: Record<string, any>;
}

const ThemeVersionSchema = new Schema<IThemeVersion>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  version: { type: Number, required: true },
  configSnapshot: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const ThemeVersionModel = mongoose.model<IThemeVersion>('ThemeVersion', ThemeVersionSchema);

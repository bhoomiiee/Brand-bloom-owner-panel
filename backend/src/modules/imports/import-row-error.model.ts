import mongoose, { Schema, Document } from 'mongoose';

export interface IImportRowError extends Document {
  storeId?: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  rowNumber: number;
  errorMessage: string;
  rowData: Record<string, any>;
}

const ImportRowErrorSchema = new Schema<IImportRowError>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', index: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'ImportJob', required: true, index: true },
  rowNumber: { type: Number, required: true },
  errorMessage: { type: String, required: true },
  rowData: { type: Schema.Types.Mixed }
});

export const ImportRowErrorModel = mongoose.model<IImportRowError>('ImportRowError', ImportRowErrorSchema);

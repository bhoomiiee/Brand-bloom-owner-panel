import mongoose, { Schema, Document } from 'mongoose';

export interface IImportJob extends Document {
  storeId: mongoose.Types.ObjectId;
  filename: string;
  status: 'PENDING' | 'PARSED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  processedRows: number;
  failedRows: number;
  columnMapping: Record<string, string>;
  headers: string[];
  parsedRows: Array<Record<string, string>>;
  createdAt: Date;
}

const ImportJobSchema = new Schema<IImportJob>({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
  filename: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'PARSED', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  totalRows: { type: Number, default: 0 },
  processedRows: { type: Number, default: 0 },
  failedRows: { type: Number, default: 0 },
  columnMapping: { type: Map, of: String, default: {} },
  headers: [{ type: String }],
  parsedRows: [{ type: Schema.Types.Mixed }]
}, { timestamps: true });

export const ImportJobModel = mongoose.model<IImportJob>('ImportJob', ImportJobSchema);

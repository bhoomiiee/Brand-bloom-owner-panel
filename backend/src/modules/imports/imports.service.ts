import { ImportJobModel } from './imports.model.js';
import { ImportRowErrorModel } from './import-row-error.model.js';
import { fileParserService } from './file-parser.service.js';
import { importValidationService } from './import-validation.service.js';
import { importCommitService } from './import-commit.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const importsService = {
  async initiateUpload(storeId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new AppError('No CSV file uploaded', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const csvContent = file.buffer.toString('utf-8');
    const { headers, rows } = fileParserService.parseCSV(csvContent);

    if (headers.length === 0 || rows.length === 0) {
      throw new AppError('CSV file is empty or missing headers', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // Convert rows to key-value objects
    const parsedRows = rows.map(row => {
      const rowObj: Record<string, string> = {};
      headers.forEach((header, idx) => {
        rowObj[header] = row[idx] || '';
      });
      return rowObj;
    });

    // Default mapping heuristic
    const defaultMapping: Record<string, string> = {};
    const standardFields = ['title', 'sku', 'price', 'description', 'stock', 'category'];
    for (const field of standardFields) {
      const match = headers.find(h => h.includes(field));
      if (match) {
        defaultMapping[field] = match;
      }
    }

    const job = await ImportJobModel.create({
      storeId,
      filename: file.originalname,
      status: 'PARSED',
      totalRows: parsedRows.length,
      headers,
      parsedRows,
      columnMapping: defaultMapping
    });

    return job;
  },

  async saveMapping(jobId: string, storeId: string, mapping: Record<string, string>) {
    const job = await ImportJobModel.findOneAndUpdate(
      { _id: jobId, storeId },
      { columnMapping: mapping },
      { new: true }
    );
    if (!job) throw new AppError('Import job not found', 404, ERROR_CODES.NOT_FOUND);
    return job;
  },

  async preview(jobId: string, storeId: string) {
    const job = await ImportJobModel.findOne({ _id: jobId, storeId });
    if (!job) throw new AppError('Import job not found', 404, ERROR_CODES.NOT_FOUND);

    const mapping = (job.columnMapping instanceof Map ? Object.fromEntries(job.columnMapping) : job.columnMapping) || {};
    const titleKey = mapping.title || 'title';
    const priceKey = mapping.price || 'price';
    const stockKey = mapping.stock || 'stock';

    let validCount = 0;
    let errorCount = 0;
    const errors: Array<{ rowNumber: number; message: string }> = [];

    const rows = job.parsedRows || [];
    rows.forEach((row, idx) => {
      const rowNumber = idx + 1;
      const title = row[titleKey];
      const price = row[priceKey];
      const stock = row[stockKey];

      const res = importValidationService.validateRow({ title, price, stock }, rowNumber);
      if (res.isValid) {
        validCount++;
      } else {
        errorCount++;
        errors.push({ rowNumber, message: res.errors.join(', ') });
      }
    });

    const sampleRows = rows.slice(0, 5);

    return {
      jobId: job._id,
      totalRows: job.totalRows,
      validCount,
      errorCount,
      sampleRows,
      previewRows: sampleRows,
      errors: errors.slice(0, 20)
    };
  },

  async commit(jobId: string, storeId: string) {
    return importCommitService.executeCommit(jobId, storeId);
  },

  async list(storeId: string) {
    return ImportJobModel.find({ storeId }).sort({ createdAt: -1 });
  }
};

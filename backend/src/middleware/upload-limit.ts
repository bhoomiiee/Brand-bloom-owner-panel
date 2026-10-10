import multer from 'multer';
import { storageConfig } from '../config/storage.js';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';

export const uploadLimit = multer({
  limits: {
    fileSize: storageConfig.maxFileSizeBytes
  },
  fileFilter: (_req, file, cb) => {
    if (storageConfig.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Disallowed file type: ${file.mimetype}`, 400, ERROR_CODES.INVALID_FILE_TYPE));
    }
  }
});

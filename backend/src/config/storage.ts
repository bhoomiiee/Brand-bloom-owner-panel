import { env } from './env.js';

export const storageConfig = {
  driver: env.STORAGE_DRIVER,
  uploadDir: env.UPLOAD_DIR,
  maxFileSizeBytes: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'text/csv']
};

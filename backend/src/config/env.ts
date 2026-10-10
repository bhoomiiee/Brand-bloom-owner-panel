import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/store_owner_portal'),
  SESSION_SECRET: z.string().default('dev-session-secret-key-32-chars-minimum-length!'),
  SESSION_EXPIRES_DAYS: z.coerce.number().default(7),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
  JWT_ACCESS_SECRET: z.string().default('dev-jwt-access-secret-32-chars-min!!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().default('dev-jwt-refresh-secret-32-chars-min!!'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  STORAGE_DRIVER: z.string().default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('Brand Bloom <noreply@brandbloom.com>'),
  FRONTEND_URL: z.string().default('http://localhost:5173')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

const rawCorsOrigins = parsed.data.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);
const expandedOrigins = new Set<string>(rawCorsOrigins);
for (const origin of rawCorsOrigins) {
  if (origin.includes('localhost')) {
    expandedOrigins.add(origin.replace('localhost', '127.0.0.1'));
  } else if (origin.includes('127.0.0.1')) {
    expandedOrigins.add(origin.replace('127.0.0.1', 'localhost'));
  }
}

export const env = {
  ...parsed.data,
  CORS_ORIGIN_LIST: Array.from(expandedOrigins)
};

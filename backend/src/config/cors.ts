import { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser agents (curl, postman, server-to-server tests where origin is undefined)
    if (!origin) {
      return callback(null, true);
    }

    if (env.CORS_ORIGIN_LIST.includes(origin)) {
      return callback(null, true);
    }

    // In development or test, allow any localhost or 127.0.0.1 port (e.g. Vite auto-incrementing to 5174, 5175, etc.)
    if (env.NODE_ENV !== 'production') {
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocal) {
        return callback(null, true);
      }
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-store-id', 'x-request-id']
};

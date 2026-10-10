import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { globalRateLimiter } from './middleware/rate-limit.js';
import { csrfProtection } from './middleware/csrf.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import healthRoutes from './routes/health.routes.js';
import apiRouter from './routes/index.js';

const app: Express = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser(env.SESSION_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestIdMiddleware);
app.use(csrfProtection);
app.use(globalRateLimiter);

// Root health check for ALB / Container probes
app.use('/health', healthRoutes);

// Mount main API
app.use(env.API_PREFIX, apiRouter);

// Fallbacks
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

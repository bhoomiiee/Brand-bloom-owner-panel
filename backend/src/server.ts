import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './config/logger.js';

const httpServer = createServer(app);

async function startServer() {
  try {
    await connectDatabase();
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`👉 API Base: http://localhost:${env.PORT}${env.API_PREFIX}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

async function shutdown() {
  logger.info('Shutting down server gracefully...');
  httpServer.close(async () => {
    await disconnectDatabase();
    logger.info('Server closed. Goodbye.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

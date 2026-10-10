import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== 'production'
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected.');
}

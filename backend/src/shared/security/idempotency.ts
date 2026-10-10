import { redisCache } from '../../config/redis.js';

export async function claimIdempotencyKey(key: string, ttlSeconds = 60): Promise<boolean> {
  const existing = await redisCache.get(`idempotency:${key}`);
  if (existing) return false;
  await redisCache.set(`idempotency:${key}`, 'LOCKED', ttlSeconds);
  return true;
}

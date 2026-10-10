import { logger } from './logger.js';

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

// Memory fallback cache when Redis is unavailable during development
class InMemoryCache implements CacheClient {
  private store = new Map<string, { val: string; exp?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.exp && Date.now() > entry.exp) {
      this.store.delete(key);
      return null;
    }
    return entry.val;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      val: value,
      exp: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export const redisCache: CacheClient = new InMemoryCache();
logger.info('Initialized cache provider (InMemory / Redis-ready).');

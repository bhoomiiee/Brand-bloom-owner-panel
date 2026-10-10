import { env } from '../src/config/env.js';

console.info('Environment verification check:');
console.info(`- NODE_ENV: ${env.NODE_ENV}`);
console.info(`- PORT: ${env.PORT}`);
console.info(`- MONGODB_URI: ${env.MONGODB_URI}`);
console.info('All environment variables loaded successfully.');

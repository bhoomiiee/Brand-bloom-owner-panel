import { connectDatabase, disconnectDatabase } from '../connection.js';
import { seedDemoStore } from './seed-demo-store.js';
import { seedCategories } from './seed-categories.js';
import { seedSampleProducts } from './seed-sample-products.js';
import { logger } from '../../config/logger.js';

async function main() {
  await connectDatabase();
  logger.info('Starting database seeder...');
  const { store, user } = await seedDemoStore();
  const categories = await seedCategories(store._id);
  await seedSampleProducts(store._id, categories[0]._id);
  logger.info(`Seeding complete for demo store '${store.name}' (User: ${user.email}).`);
  await disconnectDatabase();
}

main().catch(err => {
  logger.error('Seeding error:', err);
  process.exit(1);
});

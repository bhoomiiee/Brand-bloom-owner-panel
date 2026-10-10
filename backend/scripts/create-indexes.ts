import { connectDatabase, disconnectDatabase } from '../src/database/connection.js';
import { ensureAllIndexes } from '../src/database/indexes.js';

async function run() {
  await connectDatabase();
  await ensureAllIndexes();
  await disconnectDatabase();
}
run();

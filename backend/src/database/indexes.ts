import { UserModel } from '../modules/users/users.model.js';
import { SessionModel } from '../modules/auth/session.model.js';
import { StoreModel } from '../modules/stores/stores.model.js';
import { StoreMembershipModel } from '../modules/memberships/memberships.model.js';
import { ProductModel } from '../modules/products/products.model.js';
import { InventoryModel } from '../modules/inventory/inventory.model.js';
import { OrderModel } from '../modules/orders/orders.model.js';
import { logger } from '../config/logger.js';

export async function ensureAllIndexes() {
  logger.info('Ensuring critical database indexes...');
  await Promise.all([
    UserModel.syncIndexes(),
    SessionModel.syncIndexes(),
    StoreModel.syncIndexes(),
    StoreMembershipModel.syncIndexes(),
    ProductModel.syncIndexes(),
    InventoryModel.syncIndexes(),
    OrderModel.syncIndexes()
  ]);
  logger.info('Database indexes synchronized.');
}

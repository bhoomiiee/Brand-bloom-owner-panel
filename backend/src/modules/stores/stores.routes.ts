import { Router } from 'express';
import { storesController } from './stores.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';
import { requireRole } from '../../middleware/require-role.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { createStoreSchema, updateStoreSchema, addMemberSchema } from './stores.validation.js';

const router = Router();

// All store routes require an authenticated user
router.use(authenticate);

// Store collection routes
router.get('/', storesController.listUserStores);
router.post('/', validateRequest(createStoreSchema), storesController.createStore);

// Store-specific routes (enforces resolveStore and requireMembership)
router.get('/:storeId', resolveStore, requireMembership, storesController.getStore);
router.patch(
  '/:storeId',
  resolveStore,
  requireMembership,
  requireRole('owner'),
  validateRequest(updateStoreSchema),
  storesController.updateStore
);
router.put(
  '/:storeId',
  resolveStore,
  requireMembership,
  requireRole('owner'),
  validateRequest(updateStoreSchema),
  storesController.updateStore
);

// Store member management (owner-only write, member-accessible read)
router.post(
  '/:storeId/members',
  resolveStore,
  requireMembership,
  requireRole('owner'),
  validateRequest(addMemberSchema),
  storesController.addMember
);
router.get('/:storeId/members', resolveStore, requireMembership, storesController.listMembers);

// Customer CRM Directory & Management
import customerCrmRoutes from '../customers/customers.crm.routes.js';
router.use('/:storeId/customers', customerCrmRoutes);

// Marketing Campaigns & Promotions
import marketingRoutes from '../marketing/marketing.routes.js';
router.use('/:storeId/marketing', marketingRoutes);

export default router;

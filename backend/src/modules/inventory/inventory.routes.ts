import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/', inventoryController.listStockLevels);
router.post('/adjust', inventoryController.adjustStock);
router.get('/history/:variantId', inventoryController.getStockHistory);

export default router;

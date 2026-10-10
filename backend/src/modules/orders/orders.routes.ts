import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/', ordersController.listOrders);
router.get('/:id', ordersController.getOrder);
router.patch('/:id/status', ordersController.updateStatus);

export default router;

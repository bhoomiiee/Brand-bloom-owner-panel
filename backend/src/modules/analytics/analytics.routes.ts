import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/sales-by-product', analyticsController.getSalesByProduct);

export default router;

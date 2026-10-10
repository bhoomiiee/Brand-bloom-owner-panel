import { Router } from 'express';
import { productsController } from './products.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/', productsController.listProducts);
router.post('/', productsController.createProduct);
router.patch('/bulk', productsController.bulkUpdate);
router.get('/:id', productsController.getProduct);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

export default router;

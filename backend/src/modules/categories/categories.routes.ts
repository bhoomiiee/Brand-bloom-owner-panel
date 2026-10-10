import { Router } from 'express';
import { categoriesController } from './categories.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/', categoriesController.listCategories);
router.post('/', categoriesController.createCategory);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export default router;

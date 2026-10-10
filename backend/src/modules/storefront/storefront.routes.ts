import { Router } from 'express';
import { storefrontController } from './storefront.controller.js';
import customerRoutes from '../customers/customers.routes.js';

const router = Router();

router.get('/:storeSlug/config', storefrontController.getPublicConfig);
router.get('/:storeSlug/products', storefrontController.getPublicProducts);
router.get('/:storeSlug/products/:productSlug', storefrontController.getProductDetails);

// Customer auth, account, promotions & marketing unsubscribe
router.use('/:storeSlug/customer', customerRoutes);
router.use('/:storeSlug', customerRoutes);

export default router;

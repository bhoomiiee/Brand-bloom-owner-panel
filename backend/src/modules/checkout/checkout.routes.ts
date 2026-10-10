import { Router } from 'express';
import { checkoutController } from './checkout.controller.js';

const router = Router();

router.post('/calculate', checkoutController.calculateTotals);
router.post('/submit', checkoutController.submitCheckout);

export default router;

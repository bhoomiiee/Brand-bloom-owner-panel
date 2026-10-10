import { Router } from 'express';
import { cartsController } from './carts.controller.js';

const router = Router();

router.get('/:cartId', cartsController.getCart);
router.post('/items', cartsController.addItem);
router.delete('/items/:itemId', cartsController.removeItem);

export default router;

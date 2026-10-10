import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();
router.use(authenticate);

router.get('/me', usersController.getProfile);
router.put('/me', usersController.updateProfile);

export default router;

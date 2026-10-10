import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();
router.use(authenticate);

router.get('/', notificationsController.list);
router.patch('/:id/read', notificationsController.markRead);

export default router;

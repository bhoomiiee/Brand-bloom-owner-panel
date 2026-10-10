import { Router } from 'express';
import { healthController } from '../modules/health/health.controller.js';

const router = Router();
router.get('/', healthController.check);
router.get('/ready', healthController.ready);

export default router;

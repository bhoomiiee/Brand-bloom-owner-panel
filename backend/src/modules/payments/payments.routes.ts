import { Router } from 'express';
import { paymentsController } from './payments.controller.js';
import { webhookController } from './webhook.controller.js';

const router = Router();

router.post('/initiate', paymentsController.initiate);
router.post('/webhook', webhookController.handleWebhook);

export default router;

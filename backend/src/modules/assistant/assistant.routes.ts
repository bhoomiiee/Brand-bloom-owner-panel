import { Router } from 'express';
import { assistantController } from './assistant.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.post('/query', assistantController.askAssistant);

export default router;

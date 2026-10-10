import { Router } from 'express';
import { themesController } from './themes.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/registry', themesController.listThemes);
router.get('/config', themesController.getConfig);
router.put('/config', themesController.updateConfig);
router.post('/publish', themesController.publishConfig);

export default router;

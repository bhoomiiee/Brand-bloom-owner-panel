import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { PERMISSIONS } from '../../config/constants.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/', requirePermission(PERMISSIONS.MANAGE_STORE), auditController.listLogs);

export default router;

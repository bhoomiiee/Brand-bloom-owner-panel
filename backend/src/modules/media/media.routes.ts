import { Router } from 'express';
import { mediaController } from './media.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';
import { uploadLimit } from '../../middleware/upload-limit.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.post('/upload', uploadLimit.single('image'), mediaController.upload);
router.get('/', mediaController.list);

export default router;

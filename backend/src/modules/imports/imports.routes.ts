import { Router } from 'express';
import { importsController } from './imports.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';
import { uploadLimit } from '../../middleware/upload-limit.js';

const router = Router();
router.use(authenticate, resolveStore, requireMembership);

router.get('/template', importsController.getTemplate);
router.post('/upload', uploadLimit.single('file'), importsController.uploadFile);
router.post('/map', importsController.mapColumns);
router.post('/preview/:jobId?', importsController.preview);
router.post('/commit/:jobId?', importsController.commit);
router.get('/jobs', importsController.listJobs);

export default router;

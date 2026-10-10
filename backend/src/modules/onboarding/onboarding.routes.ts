import { Router } from 'express';
import { onboardingController } from './onboarding.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();
router.use(authenticate);

router.get('/draft', onboardingController.getDraft);
router.post('/draft', onboardingController.saveDraft);
router.post('/complete', onboardingController.complete);

export default router;

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rate-limit.js';

const router = Router();

router.use(authRateLimiter);

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;

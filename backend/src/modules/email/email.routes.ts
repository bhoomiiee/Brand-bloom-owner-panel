import { Router, Request, Response, NextFunction } from 'express';
import { emailService } from './email.service.js';
import { env } from '../../config/env.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

/**
 * GET /api/v1/email/status
 * Check whether email delivery is configured without exposing secrets
 */
router.get('/status', (req: Request, res: Response) => {
  const isConfigured = emailService.isConfigured();
  const provider = emailService.getActiveProviderName();

  res.json({
    success: true,
    data: {
      isConfigured,
      provider,
      from: env.EMAIL_FROM || 'onboarding@resend.dev',
      environment: env.NODE_ENV
    }
  });
});

/**
 * Middleware ensuring test endpoint is only accessible in development
 * OR by authenticated administrators/users
 */
const requireDevOrAuth = (req: Request, res: Response, next: NextFunction) => {
  if (env.NODE_ENV === 'development') {
    return next();
  }
  // In production or test, enforce authentication
  return authenticate(req, res, next);
};

/**
 * POST /api/v1/email/test
 * Send a verified test email via Resend
 */
router.post('/test', requireDevOrAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { to } = req.body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'A valid recipient email address is required in the "to" field.'
      });
    }

    const trimmedEmail = to.trim().toLowerCase();
    const result = await emailService.sendTestEmail(trimmedEmail);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        provider: result.provider || 'resend',
        error: result.error || 'Failed to dispatch test email through email provider'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        provider: result.provider || 'resend',
        messageId: result.messageId,
        recipient: trimmedEmail,
        message: 'Congratulations! Your Store Owner Portal email integration is working.'
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

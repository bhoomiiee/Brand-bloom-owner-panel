import { Router, Request, Response, NextFunction } from 'express';
import { promotionsService } from './promotions.service.js';
import { campaignsService } from './campaigns.service.js';
import { authenticate } from '../../middleware/authenticate.js';
import { resolveStore } from '../../middleware/resolve-store.js';
import { requireMembership } from '../../middleware/require-membership.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(resolveStore);
router.use(requireMembership);

// --- PROMOTIONS ---
router.get('/promotions', requirePermission('promotions:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const promotions = await promotionsService.listPromotions(storeId);
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

router.post('/promotions', requirePermission('promotions:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const { code, type, value, description, minSubtotalCents, maxDiscountCents, usageLimit, startsAt, expiresAt } = req.body;
    if (!code || !type || value === undefined) {
      throw new AppError('Code, discount type, and value are required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const promotion = await promotionsService.createPromotion(storeId, {
      code,
      type,
      value,
      description,
      minSubtotalCents,
      maxDiscountCents,
      usageLimit,
      startsAt,
      expiresAt
    });

    res.status(201).json({ success: true, message: 'Promotion created', data: promotion });
  } catch (err) {
    next(err);
  }
});

router.put('/promotions/:id', requirePermission('promotions:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const updated = await promotionsService.updatePromotion(storeId, req.params.id, req.body);
    res.json({ success: true, message: 'Promotion updated', data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/promotions/:id', requirePermission('promotions:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    await promotionsService.deletePromotion(storeId, req.params.id);
    res.json({ success: true, message: 'Promotion deleted' });
  } catch (err) {
    next(err);
  }
});

// --- CAMPAIGNS ---
router.get('/campaigns', requirePermission('campaigns:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const campaigns = await campaignsService.listCampaigns(storeId);
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns', requirePermission('campaigns:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const { name, subject, contentHtml, contentText, targetSegment, promotionCode, scheduledAt } = req.body;
    const bodyContent = contentHtml || req.body.content || '';
    if (!name || !subject || !bodyContent) {
      throw new AppError('Campaign name, subject line, and content are required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const campaign = await campaignsService.createCampaign(storeId, {
      name,
      subject,
      contentHtml: bodyContent,
      contentText: contentText || bodyContent,
      targetSegment,
      promotionCode,
      scheduledAt
    });

    res.status(201).json({ success: true, message: 'Campaign draft created', data: campaign });
  } catch (err) {
    next(err);
  }
});

router.get('/campaigns/:id', requirePermission('campaigns:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const campaign = await campaignsService.getCampaign(storeId, req.params.id);
    res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
});

router.put('/campaigns/:id', requirePermission('campaigns:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const updated = await campaignsService.updateCampaign(storeId, req.params.id, req.body);
    res.json({ success: true, message: 'Campaign updated', data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/campaigns/:id', requirePermission('campaigns:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    await campaignsService.deleteCampaign(storeId, req.params.id);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns/:id/test', requirePermission('campaigns:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const { email } = req.body;
    if (!email) throw new AppError('Test recipient email is required', 400, ERROR_CODES.VALIDATION_ERROR);

    const result = await campaignsService.sendTestEmail(storeId, req.params.id, email);
    res.json({ data: result, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/campaigns/:id/send', requirePermission('campaigns:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const result = await campaignsService.sendCampaign(storeId, req.params.id);
    res.json({ data: result, ...result });
  } catch (err) {
    next(err);
  }
});

// --- MARKETING ANALYTICS ---
import { marketingAnalyticsService } from './marketing-analytics.service.js';
router.get('/analytics', requirePermission('marketing:analytics'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const storeId = (req.params.storeId || req.storeId) as string;
    const timeRange = (req.query.timeRange as any) || '30d';
    const analytics = await marketingAnalyticsService.getStoreMarketingAnalytics(storeId, timeRange);
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Request, Response } from 'express';
import { onboardingService } from './onboarding.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const onboardingController = {
  getDraft: asyncHandler(async (req: Request, res: Response) => {
    const draft = await onboardingService.getDraft(req.user!.userId);
    res.json(ApiResponse.success(draft));
  }),

  saveDraft: asyncHandler(async (req: Request, res: Response) => {
    const draft = await onboardingService.saveDraft(req.user!.userId, req.body);
    res.json(ApiResponse.success(draft));
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const store = await onboardingService.completeOnboarding(req.user!.userId);
    res.status(201).json(ApiResponse.created(store));
  })
};

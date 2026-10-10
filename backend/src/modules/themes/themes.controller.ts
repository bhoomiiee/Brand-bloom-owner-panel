import { Request, Response } from 'express';
import { themesService } from './themes.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const themesController = {
  listThemes: asyncHandler(async (_req: Request, res: Response) => {
    const list = await themesService.getThemes();
    res.json(ApiResponse.success(list));
  }),

  getConfig: asyncHandler(async (req: Request, res: Response) => {
    const config = await themesService.getStorefrontConfig(req.storeId!);
    res.json(ApiResponse.success(config));
  }),

  updateConfig: asyncHandler(async (req: Request, res: Response) => {
    const updated = await themesService.updateConfig(req.storeId!, req.body);
    res.json(ApiResponse.success(updated));
  }),

  publishConfig: asyncHandler(async (req: Request, res: Response) => {
    const published = await themesService.publish(req.storeId!);
    res.json(ApiResponse.success(published));
  })
};

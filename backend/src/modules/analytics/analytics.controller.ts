import { Request, Response } from 'express';
import { analyticsService } from './analytics.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const analyticsController = {
  getDashboard: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getDashboardMetrics(req.storeId!, req.query);
    res.json(ApiResponse.success(data));
  }),

  getSalesByProduct: asyncHandler(async (req: Request, res: Response) => {
    const data = await analyticsService.getSalesByProduct(req.storeId!, req.query);
    res.json(ApiResponse.success(data));
  })
};

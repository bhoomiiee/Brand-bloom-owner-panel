import { Request, Response } from 'express';
import { inventoryService } from './inventory.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const inventoryController = {
  listStockLevels: asyncHandler(async (req: Request, res: Response) => {
    const list = await inventoryService.listByStore(req.storeId!);
    res.json(ApiResponse.success(list));
  }),

  adjustStock: asyncHandler(async (req: Request, res: Response) => {
    const updated = await inventoryService.adjustStock(req.storeId!, req.body, req.user!.userId);
    res.json(ApiResponse.success(updated));
  }),

  getStockHistory: asyncHandler(async (req: Request, res: Response) => {
    const history = await inventoryService.getHistory(req.storeId!, req.params.variantId);
    res.json(ApiResponse.success(history));
  })
};

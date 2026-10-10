import { Request, Response } from 'express';
import { notificationsService } from './notifications.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const storeId = req.storeId || req.headers['x-store-id'] as string;
    const list = storeId
      ? await notificationsService.getStoreNotifications(storeId)
      : await notificationsService.getUserNotifications(req.user!.userId);
    res.json(ApiResponse.success(list));
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const storeId = req.storeId || req.headers['x-store-id'] as string;
    const updated = await notificationsService.markRead(storeId, req.params.id);
    res.json(ApiResponse.success(updated));
  })
};

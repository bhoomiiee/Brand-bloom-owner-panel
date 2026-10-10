import { Request, Response } from 'express';
import { mediaService } from './media.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const mediaController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    const asset = await mediaService.saveAsset(req.storeId!, req.file!);
    res.status(201).json(ApiResponse.created(asset));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const list = await mediaService.list(req.storeId!);
    res.json(ApiResponse.success(list));
  })
};

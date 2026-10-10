import { Request, Response } from 'express';
import { auditService } from './audit.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const auditController = {
  listLogs: asyncHandler(async (req: Request, res: Response) => {
    const logs = await auditService.listByStore(req.storeId!);
    res.json(ApiResponse.success(logs));
  })
};

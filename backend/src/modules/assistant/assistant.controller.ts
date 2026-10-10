import { Request, Response } from 'express';
import { assistantService } from './assistant.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const assistantController = {
  askAssistant: asyncHandler(async (req: Request, res: Response) => {
    const response = await assistantService.processQuery(req.storeId!, req.body.question);
    res.json(ApiResponse.success(response));
  })
};

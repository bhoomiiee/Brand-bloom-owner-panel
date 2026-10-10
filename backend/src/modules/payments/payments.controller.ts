import { Request, Response } from 'express';
import { paymentsService } from './payments.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const paymentsController = {
  initiate: asyncHandler(async (req: Request, res: Response) => {
    const attempt = await paymentsService.createPaymentIntent(req.body);
    res.json(ApiResponse.success(attempt));
  })
};

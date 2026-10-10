import { Request, Response } from 'express';
import { checkoutService } from './checkout.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const checkoutController = {
  calculateTotals: asyncHandler(async (req: Request, res: Response) => {
    const totals = await checkoutService.calculate(req.body);
    res.json(ApiResponse.success(totals));
  }),

  submitCheckout: asyncHandler(async (req: Request, res: Response) => {
    const order = await checkoutService.submit(req.body);
    res.status(201).json(ApiResponse.created(order));
  })
};

import { Request, Response } from 'express';
import { cartsService } from './carts.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const cartsController = {
  getCart: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartsService.getById(req.params.cartId);
    res.json(ApiResponse.success(cart));
  }),

  addItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartsService.addItem(req.body);
    res.json(ApiResponse.success(cart));
  }),

  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartsService.removeItem(req.body.cartId, req.params.itemId);
    res.json(ApiResponse.success(cart));
  })
};

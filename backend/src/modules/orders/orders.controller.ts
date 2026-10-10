import { Request, Response } from 'express';
import { ordersService } from './orders.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { parsePagination } from '../../shared/http/pagination.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const ordersController = {
  listOrders: asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req);
    const result = await ordersService.list(req.storeId!, pagination, req.query);
    res.json(ApiResponse.success(result.items, result.meta));
  }),

  getOrder: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.getById(req.storeId!, req.params.id);
    res.json(ApiResponse.success(order));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const updated = await ordersService.transitionStatus(req.storeId!, req.params.id, req.body.status, req.user!.userId);
    res.json(ApiResponse.success(updated));
  })
};

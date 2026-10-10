import { Request, Response } from 'express';
import { productsService } from './products.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { parsePagination } from '../../shared/http/pagination.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const productsController = {
  listProducts: asyncHandler(async (req: Request, res: Response) => {
    const pagination = parsePagination(req);
    const result = await productsService.list(req.storeId!, pagination, req.query);
    res.json(ApiResponse.success(result.items, result.meta));
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.create(req.storeId!, req.body);
    res.status(201).json(ApiResponse.created(product));
  }),

  getProduct: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.getById(req.storeId!, req.params.id);
    res.json(ApiResponse.success(product));
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const updated = await productsService.update(req.storeId!, req.params.id, req.body);
    res.json(ApiResponse.success(updated));
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    await productsService.delete(req.storeId!, req.params.id);
    res.json(ApiResponse.success({ message: 'Product archived.' }));
  }),

  bulkUpdate: asyncHandler(async (req: Request, res: Response) => {
    const result = await productsService.bulkUpdate(req.storeId!, req.body.updates || []);
    res.json(ApiResponse.success(result));
  })
};

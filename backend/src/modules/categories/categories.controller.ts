import { Request, Response } from 'express';
import { categoriesService } from './categories.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const categoriesController = {
  listCategories: asyncHandler(async (req: Request, res: Response) => {
    const list = await categoriesService.listByStore(req.storeId!);
    res.json(ApiResponse.success(list));
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const cat = await categoriesService.create(req.storeId!, req.body);
    res.status(201).json(ApiResponse.created(cat));
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const cat = await categoriesService.update(req.storeId!, req.params.id, req.body);
    res.json(ApiResponse.success(cat));
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    await categoriesService.delete(req.storeId!, req.params.id);
    res.json(ApiResponse.success({ message: 'Category removed.' }));
  })
};

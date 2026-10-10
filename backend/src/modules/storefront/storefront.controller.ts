import { Request, Response } from 'express';
import { storefrontService } from './storefront.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const storefrontController = {
  getPublicConfig: asyncHandler(async (req: Request, res: Response) => {
    const config = await storefrontService.getConfigBySlug(req.params.storeSlug);
    res.json(ApiResponse.success(config));
  }),

  getPublicProducts: asyncHandler(async (req: Request, res: Response) => {
    const products = await storefrontService.getProductsBySlug(req.params.storeSlug, req.query);
    res.json(ApiResponse.success(products));
  }),

  getProductDetails: asyncHandler(async (req: Request, res: Response) => {
    const product = await storefrontService.getProductDetail(req.params.storeSlug, req.params.productSlug);
    res.json(ApiResponse.success(product));
  })
};

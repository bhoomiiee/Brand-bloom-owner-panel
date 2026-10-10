import { Request, Response } from 'express';
import { storesService } from './stores.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const storesController = {
  listUserStores: asyncHandler(async (req: Request, res: Response) => {
    const stores = await storesService.listForUser(req.user!.id);
    res.json(ApiResponse.success(stores));
  }),

  createStore: asyncHandler(async (req: Request, res: Response) => {
    const result = await storesService.create(req.user!.id, req.body);
    res.status(201).json(ApiResponse.created(result));
  }),

  getStore: asyncHandler(async (req: Request, res: Response) => {
    const store = await storesService.getById(req.storeId!, req.user!.id);
    res.json(ApiResponse.success(store));
  }),

  updateStore: asyncHandler(async (req: Request, res: Response) => {
    const updated = await storesService.update(req.storeId!, req.body);
    res.json(ApiResponse.success(updated));
  }),

  addMember: asyncHandler(async (req: Request, res: Response) => {
    const member = await storesService.addStaffMember(req.storeId!, req.body);
    res.status(201).json(ApiResponse.created(member));
  }),

  listMembers: asyncHandler(async (req: Request, res: Response) => {
    const members = await storesService.listMembers(req.storeId!);
    res.json(ApiResponse.success(members));
  })
};

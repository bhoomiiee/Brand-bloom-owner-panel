import { Request, Response } from 'express';
import { usersService } from './users.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const usersController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.getById(req.user!.userId);
    res.json(ApiResponse.success(user));
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const updated = await usersService.updateProfile(req.user!.userId, req.body);
    res.json(ApiResponse.success(updated));
  })
};

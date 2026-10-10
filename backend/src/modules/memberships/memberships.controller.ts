import { Request, Response } from 'express';
import { membershipsService } from './memberships.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const membershipsController = {
  listMembers: asyncHandler(async (req: Request, res: Response) => {
    const list = await membershipsService.listMembers(req.storeId!);
    res.json(ApiResponse.success(list));
  }),

  inviteStaff: asyncHandler(async (req: Request, res: Response) => {
    const invitation = await membershipsService.createInvitation(req.storeId!, req.body, req.user!.userId);
    res.status(201).json(ApiResponse.created(invitation));
  }),

  acceptInvitation: asyncHandler(async (req: Request, res: Response) => {
    const result = await membershipsService.acceptInvitation(req.body.token, req.user!.userId);
    res.json(ApiResponse.success(result));
  }),

  removeMember: asyncHandler(async (req: Request, res: Response) => {
    await membershipsService.remove(req.storeId!, req.params.id, req.user!.userId);
    res.json(ApiResponse.success({ message: 'Member removed.' }));
  }),

  updatePermissions: asyncHandler(async (req: Request, res: Response) => {
    const updated = await membershipsService.updatePermissions(
      req.storeId!,
      req.params.id,
      req.body.permissions,
      req.user!.userId
    );
    res.json(ApiResponse.success(updated));
  })
};

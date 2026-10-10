import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { readinessService } from './readiness.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const healthController = {
  check: (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json(
      ApiResponse.success({
        status: isDbConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        database: isDbConnected ? 'connected' : 'disconnected'
      })
    );
  },

  ready: asyncHandler(async (_req: Request, res: Response) => {
    const status = await readinessService.checkDependencies();
    res.json(ApiResponse.success(status));
  })
};

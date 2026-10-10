import { Request, Response } from 'express';
import { importsService } from './imports.service.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

export const importsController = {
  getTemplate: asyncHandler(async (_req: Request, res: Response) => {
    const { importTemplateService } = await import('./import-template.service.js');
    const csv = importTemplateService.getCsvTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product_import_template.csv"');
    res.send(csv);
  }),

  uploadFile: asyncHandler(async (req: Request, res: Response) => {
    const job = await importsService.initiateUpload(req.storeId!, req.file!);
    res.status(201).json(ApiResponse.created(job));
  }),

  mapColumns: asyncHandler(async (req: Request, res: Response) => {
    const updated = await importsService.saveMapping(req.body.jobId, req.storeId!, req.body.columnMapping);
    res.json(ApiResponse.success(updated));
  }),

  preview: asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId || req.body.jobId;
    const previewData = await importsService.preview(jobId, req.storeId!);
    res.json(ApiResponse.success(previewData));
  }),

  commit: asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.params.jobId || req.body.jobId;
    const result = await importsService.commit(jobId, req.storeId!);
    res.json(ApiResponse.success(result));
  }),

  listJobs: asyncHandler(async (req: Request, res: Response) => {
    const jobs = await importsService.list(req.storeId!);
    res.json(ApiResponse.success(jobs));
  })
};

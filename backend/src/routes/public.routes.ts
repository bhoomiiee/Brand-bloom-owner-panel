import { Router } from 'express';
import { ApiResponse } from '../shared/http/api-response.js';

const router = Router();

router.get('/info', (_req, res) => {
  res.json(ApiResponse.success({
    name: 'Store Owner Portal API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  }));
});

export default router;

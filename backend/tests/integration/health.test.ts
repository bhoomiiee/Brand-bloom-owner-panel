import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Health & Infrastructure Integration Tests', () => {
  it('GET /api/v1/health returns healthy status and connected database', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.database).toBe('connected');
    expect(res.body.data.timestamp).toBeDefined();
  });

  it('GET /api/v1/health/ready returns service readiness', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('READY');
    expect(res.body.data.database).toBe('CONNECTED');
  });

  it('handles unknown routes with a consistent 404 error envelope', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('Route not found');
  });
});

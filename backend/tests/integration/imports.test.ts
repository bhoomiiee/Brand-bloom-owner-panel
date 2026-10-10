import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { ImportJobModel } from '../../src/modules/imports/imports.model.js';
import { ImportRowErrorModel } from '../../src/modules/imports/import-row-error.model.js';
import { ProductModel } from '../../src/modules/products/products.model.js';
import { ProductVariantModel } from '../../src/modules/products/product-variants.model.js';
import { InventoryModel } from '../../src/modules/inventory/inventory.model.js';

describe('Spreadsheet & CSV Imports Integration Tests', () => {
  async function setupStoreOwner(email: string, storeName: string) {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: 'Import Merchant', password: 'SecurePassword123!' });
    const cookie = authRes.headers['set-cookie'][0];

    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName, currency: 'USD' });
    const store = storeRes.body.data.store;
    const storeId = store._id || store.id;

    return { cookie, storeId, store };
  }

  it('serves downloadable CSV import template with standard headers', async () => {
    const { cookie, storeId } = await setupStoreOwner('import_template@example.com', 'Template Store');

    const res = await request(app)
      .get('/api/v1/imports/template')
      .set('Cookie', cookie)
      .set('x-store-id', storeId);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('product_import_template.csv');
    expect(res.text.toLowerCase()).toContain('title,sku,price');
  });

  it('uploads CSV, neutralizes formula injection, validates rows, and commits to catalog', async () => {
    const { cookie, storeId } = await setupStoreOwner('import_commit@example.com', 'Commit Store');

    // CSV with:
    // Row 1: Valid product
    // Row 2: Formula injection attempt in Title (=1+1 Dangerous)
    // Row 3: Invalid row (missing title) -> should generate row error
    const csvContent = [
      'Title,SKU,Price,Stock,Description',
      'Merino Crewneck,MERINO-01,75.00,20,Fine merino wool',
      '=1+1 Dangerous,FORMULA-01,45.00,10,Formula injection test',
      ',INVALID-SKU,-10,0,Missing title and negative price'
    ].join('\n');

    const uploadRes = await request(app)
      .post('/api/v1/imports/upload')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .attach('file', Buffer.from(csvContent), 'catalog.csv');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.success).toBe(true);
    const jobId = uploadRes.body.data.jobId || uploadRes.body.data._id || uploadRes.body.data.id;
    expect(jobId).toBeDefined();

    // Verify preview
    const previewRes = await request(app)
      .post('/api/v1/imports/preview')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ jobId });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.data.totalRows).toBe(3);

    // Formula injection check: the leading '=' must be sanitized/stripped
    const rows = previewRes.body.data.sampleRows || previewRes.body.data.previewRows || [];
    const sanitizedRow = rows.find((r: any) => r.SKU === 'FORMULA-01' || r.sku === 'FORMULA-01');
    expect(sanitizedRow).toBeDefined();
    expect((sanitizedRow.title || sanitizedRow.Title)).not.toMatch(/^=/);

    // Commit the import
    const commitRes = await request(app)
      .post('/api/v1/imports/commit')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ jobId });

    expect(commitRes.status).toBe(200);
    expect(commitRes.body.success).toBe(true);
    const result = commitRes.body.data;
    expect(result.importedCount).toBe(2); // Rows 1 and 2 imported
    expect(result.failedCount).toBe(1);   // Row 3 failed validation

    // Verify row errors recorded in DB
    const rowErrors = await ImportRowErrorModel.find({ jobId, storeId });
    expect(rowErrors.length).toBe(1);
    expect(rowErrors[0].rowNumber).toBe(3); // Data row 3 in CSV

    // Verify products created in database
    const p1 = await ProductModel.findOne({ storeId, title: 'Merino Crewneck' });
    expect(p1).not.toBeNull();
    expect(p1!.basePriceCents).toBe(7500);

    // Verify inventory created for imported product
    const v1 = await ProductVariantModel.findOne({ storeId, productId: p1!._id });
    expect(v1).not.toBeNull();
    const inv1 = await InventoryModel.findOne({ storeId, variantId: v1!._id });
    expect(inv1!.onHand).toBe(20);

    // Verify job status in DB
    const job = await ImportJobModel.findById(jobId);
    expect(job!.status).toBe('COMPLETED');
    expect(job!.processedRows).toBe(2);
    expect(job!.failedRows).toBe(1);
  });

  it('enforces tenant boundary on import jobs', async () => {
    const storeA = await setupStoreOwner('import_tenant_a@example.com', 'Import Store A');
    const storeB = await setupStoreOwner('import_tenant_b@example.com', 'Import Store B');

    // Store A uploads CSV
    const csvContent = 'Title,SKU,Price,Stock\nSecret Product,SEC-01,99.00,5';
    const uploadA = await request(app)
      .post('/api/v1/imports/upload')
      .set('Cookie', storeA.cookie)
      .set('x-store-id', storeA.storeId)
      .attach('file', Buffer.from(csvContent), 'secret.csv');
    const jobIdA = uploadA.body.data.jobId;

    // Store B tries to preview or commit Store A's import job
    const crossPreview = await request(app)
      .post('/api/v1/imports/preview')
      .set('Cookie', storeB.cookie)
      .set('x-store-id', storeB.storeId)
      .send({ jobId: jobIdA });

    expect([400, 404]).toContain(crossPreview.status);

    const crossCommit = await request(app)
      .post('/api/v1/imports/commit')
      .set('Cookie', storeB.cookie)
      .set('x-store-id', storeB.storeId)
      .send({ jobId: jobIdA });

    expect([400, 404]).toContain(crossCommit.status);
  });
});

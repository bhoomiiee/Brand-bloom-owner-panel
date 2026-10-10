import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { ProductModel } from '../../src/modules/products/products.model.js';
import { ProductVariantModel } from '../../src/modules/products/product-variants.model.js';
import { InventoryModel } from '../../src/modules/inventory/inventory.model.js';

describe('Products & Variants Integration Tests', () => {
  async function setupStoreOwner(email: string, storeName: string) {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: 'Store Owner', password: 'SecurePassword123!' });
    const cookie = authRes.headers['set-cookie'][0];

    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName, currency: 'USD' });
    const store = storeRes.body.data.store;
    const storeId = store._id || store.id;

    return { cookie, storeId, store };
  }

  it('creates a product with default variant and initial inventory record', async () => {
    const { cookie, storeId } = await setupStoreOwner('product_owner1@example.com', 'Product Store 1');

    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        title: 'Classic Oxford Shirt',
        description: '100% fine cotton oxford weave',
        basePriceCents: 8500,
        sku: 'OXFORD-WHT-M',
        initialStock: 25
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const product = res.body.data;
    expect(product.title).toBe('Classic Oxford Shirt');
    expect(product.basePriceCents).toBe(8500);

    // Verify in database
    const dbProduct = await ProductModel.findById(product._id || product.id);
    expect(dbProduct).not.toBeNull();
    expect(dbProduct!.storeId.toString()).toBe(storeId);

    // Verify default variant was created
    const variant = await ProductVariantModel.findOne({ productId: dbProduct!._id });
    expect(variant).not.toBeNull();
    expect(variant!.sku).toBe('OXFORD-WHT-M');
    expect(variant!.priceCents).toBe(8500);

    // Verify inventory tracking record was created
    const inv = await InventoryModel.findOne({ variantId: variant!._id, storeId });
    expect(inv).not.toBeNull();
    expect(inv!.onHand).toBe(25);
    expect(inv!.reserved).toBe(0);
  });

  it('enforces unique SKU per store but allows identical SKU across different stores', async () => {
    const storeA = await setupStoreOwner('owner_sku_a@example.com', 'Store A');
    const storeB = await setupStoreOwner('owner_sku_b@example.com', 'Store B');

    // Store A creates product with SKU 'SHARED-SKU-99'
    const resA1 = await request(app)
      .post('/api/v1/products')
      .set('Cookie', storeA.cookie)
      .set('x-store-id', storeA.storeId)
      .send({
        title: 'Product One',
        basePriceCents: 5000,
        sku: 'SHARED-SKU-99'
      });
    expect(resA1.status).toBe(201);

    // Store A tries to create ANOTHER product with identical SKU 'SHARED-SKU-99' -> Must be 409 Conflict
    const resA2 = await request(app)
      .post('/api/v1/products')
      .set('Cookie', storeA.cookie)
      .set('x-store-id', storeA.storeId)
      .send({
        title: 'Duplicate SKU Product',
        basePriceCents: 6000,
        sku: 'SHARED-SKU-99'
      });
    expect(resA2.status).toBe(409);
    expect(resA2.body.error.code).toBe('CONFLICT');

    // Store B creates product with SAME SKU 'SHARED-SKU-99' -> Must succeed due to tenant isolation
    const resB = await request(app)
      .post('/api/v1/products')
      .set('Cookie', storeB.cookie)
      .set('x-store-id', storeB.storeId)
      .send({
        title: 'Store B Product',
        basePriceCents: 5500,
        sku: 'SHARED-SKU-99'
      });
    expect(resB.status).toBe(201);
  });

  it('retrieves product by ID with populated variants and inventory', async () => {
    const { cookie, storeId } = await setupStoreOwner('product_get@example.com', 'Store Get');

    const createRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        title: 'Wool Crewneck Sweater',
        basePriceCents: 12000,
        initialStock: 14
      });
    const productId = createRes.body.data._id || createRes.body.data.id;

    const getRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId);

    expect(getRes.status).toBe(200);
    const prodData = getRes.body.data.product || getRes.body.data;
    expect(prodData.title).toBe('Wool Crewneck Sweater');
    expect(getRes.body.data.variants).toBeDefined();
    expect(getRes.body.data.variants.length).toBeGreaterThan(0);
    expect(getRes.body.data.variants[0].onHand).toBe(14);
  });

  it('updates product and supports bulk updates', async () => {
    const { cookie, storeId } = await setupStoreOwner('product_bulk@example.com', 'Store Bulk');

    const p1 = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ title: 'Tee A', basePriceCents: 3000 });
    const p2 = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ title: 'Tee B', basePriceCents: 3500 });

    const p1Id = p1.body.data._id || p1.body.data.id;
    const p2Id = p2.body.data._id || p2.body.data.id;

    // Single update
    const patchRes = await request(app)
      .put(`/api/v1/products/${p1Id}`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ title: 'Tee A Premium', basePriceCents: 3200 });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.title).toBe('Tee A Premium');
    expect(patchRes.body.data.basePriceCents).toBe(3200);

    // Bulk update with updates array
    const bulkRes = await request(app)
      .patch('/api/v1/products/bulk')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        updates: [
          { id: p1Id, data: { status: 'ARCHIVED' } },
          { id: p2Id, data: { status: 'ARCHIVED' } }
        ]
      });
    expect(bulkRes.status).toBe(200);
    expect(bulkRes.body.data.updated).toBe(2);
  });
});

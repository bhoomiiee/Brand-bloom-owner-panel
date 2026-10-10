import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { InventoryModel } from '../../src/modules/inventory/inventory.model.js';
import { InventoryMovementModel } from '../../src/modules/inventory/inventory-movement.model.js';

describe('Inventory & Ledger Integration Tests', () => {
  async function setupStoreOwner(email: string, storeName: string) {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: 'Inventory Owner', password: 'SecurePassword123!' });
    const cookie = authRes.headers['set-cookie'][0];

    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName, currency: 'USD' });
    const store = storeRes.body.data.store;
    const storeId = store._id || store.id;

    return { cookie, storeId, user: authRes.body.data.user };
  }

  async function createTestProduct(cookie: string, storeId: string, title: string, initialStock: number) {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        title,
        basePriceCents: 4500,
        initialStock
      });
    const productId = res.body.data._id || res.body.data.id;

    // Get product variant ID
    const getRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId);

    const variant = getRes.body.data.variants[0];
    return { productId, variantId: variant._id };
  }

  it('lists inventory balances for store', async () => {
    const { cookie, storeId } = await setupStoreOwner('inv_list@example.com', 'Inv Store List');
    await createTestProduct(cookie, storeId, 'Item Alpha', 10);
    await createTestProduct(cookie, storeId, 'Item Beta', 20);

    const res = await request(app)
      .get('/api/v1/inventory')
      .set('Cookie', cookie)
      .set('x-store-id', storeId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('performs atomic positive stock adjustment and creates movement ledger entry', async () => {
    const { cookie, storeId, user } = await setupStoreOwner('inv_adj_up@example.com', 'Inv Store Up');
    const { variantId } = await createTestProduct(cookie, storeId, 'Restock Denim', 15);

    const adjustRes = await request(app)
      .post('/api/v1/inventory/adjust')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        variantId,
        delta: 10,
        reason: 'Shipment #PO-9021 arrived'
      });

    expect(adjustRes.status).toBe(200);
    expect(adjustRes.body.data.onHand).toBe(25);

    // Verify DB state
    const inv = await InventoryModel.findOne({ storeId, variantId });
    expect(inv!.onHand).toBe(25);

    // Verify audit ledger
    const ledger = await InventoryMovementModel.findOne({ storeId, variantId, type: 'ADJUST_UP' });
    expect(ledger).not.toBeNull();
    expect(ledger!.delta).toBe(10);
    expect(ledger!.balanceAfter).toBe(25);
    expect(ledger!.reason).toBe('Shipment #PO-9021 arrived');
    expect(ledger!.performedBy?.toString()).toBe(user.id);
  });

  it('performs atomic negative stock adjustment and prevents negative balances', async () => {
    const { cookie, storeId } = await setupStoreOwner('inv_adj_down@example.com', 'Inv Store Down');
    const { variantId } = await createTestProduct(cookie, storeId, 'Fragile Glassware', 5);

    // Valid reduction of 3 units
    const validDown = await request(app)
      .post('/api/v1/inventory/adjust')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        variantId,
        delta: -3,
        reason: 'Damaged in warehouse'
      });
    expect(validDown.status).toBe(200);
    expect(validDown.body.data.onHand).toBe(2);

    // Attempt to reduce by 5 units (when only 2 exist) -> Must fail with 400
    const oversellAttempt = await request(app)
      .post('/api/v1/inventory/adjust')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        variantId,
        delta: -5,
        reason: 'Over-deduct test'
      });
    expect(oversellAttempt.status).toBe(400);

    // Verify DB onHand is STILL 2 and was not decremented below zero
    const inv = await InventoryModel.findOne({ storeId, variantId });
    expect(inv!.onHand).toBe(2);
  });

  it('rejects invalid adjustment deltas (zero or non-integer)', async () => {
    const { cookie, storeId } = await setupStoreOwner('inv_invalid@example.com', 'Inv Store Invalid');
    const { variantId } = await createTestProduct(cookie, storeId, 'Sample Item', 5);

    const zeroRes = await request(app)
      .post('/api/v1/inventory/adjust')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ variantId, delta: 0, reason: 'Zero delta' });
    expect(zeroRes.status).toBe(400);

    const floatRes = await request(app)
      .post('/api/v1/inventory/adjust')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ variantId, delta: 2.5, reason: 'Float delta' });
    expect(floatRes.status).toBe(400);
  });

  it('enforces tenant boundary on inventory operations', async () => {
    const storeA = await setupStoreOwner('inv_tenant_a@example.com', 'Store A');
    const storeB = await setupStoreOwner('inv_tenant_b@example.com', 'Store B');

    const itemA = await createTestProduct(storeA.cookie, storeA.storeId, 'Store A Secret Item', 100);

    // Store B attempts to adjust Store A's inventory
    const crossRes = await request(app)
      .post('/api/v1/inventory/adjust')
      .set('Cookie', storeB.cookie)
      .set('x-store-id', storeB.storeId)
      .send({
        variantId: itemA.variantId,
        delta: -10,
        reason: 'Malicious deduction'
      });

    // Cannot adjust item belonging to another store
    expect([400, 404]).toContain(crossRes.status);

    // Store A item remains unchanged at 100
    const invA = await InventoryModel.findOne({ storeId: storeA.storeId, variantId: itemA.variantId });
    expect(invA!.onHand).toBe(100);
  });
});

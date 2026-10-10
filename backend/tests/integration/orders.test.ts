import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { InventoryModel } from '../../src/modules/inventory/inventory.model.js';
import { OrderModel } from '../../src/modules/orders/orders.model.js';
import { OrderEventModel } from '../../src/modules/orders/order-event.model.js';

describe('Orders & State Machine Integration Tests', () => {
  async function setupStoreOwner(email: string, storeName: string) {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: 'Order Owner', password: 'SecurePassword123!' });
    const cookie = authRes.headers['set-cookie'][0];

    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName, currency: 'USD' });
    const store = storeRes.body.data.store;
    const storeId = store._id || store.id;

    return { cookie, storeId, user: authRes.body.data.user };
  }

  async function createOrder(cookie: string, storeId: string, initialStock = 10, orderQty = 2) {
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        title: 'Linen Trousers',
        basePriceCents: 9000,
        initialStock
      });
    const productId = prodRes.body.data._id || prodRes.body.data.id;

    const getRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId);
    const variantId = getRes.body.data.variants[0]._id;

    const checkoutRes = await request(app)
      .post('/api/v1/checkout/submit')
      .send({
        storeId,
        customerEmail: 'order_customer@example.com',
        items: [{ variantId, quantity: orderQty }],
        shippingAddress: { street: '123 Test St', city: 'City', state: 'ST', postalCode: '12345', country: 'US' }
      });

    const order = checkoutRes.body.data.order || checkoutRes.body.data;
    return { order, variantId };
  }

  it('lists orders with store scoping', async () => {
    const { cookie, storeId } = await setupStoreOwner('order_list@example.com', 'Order Store List');
    await createOrder(cookie, storeId);
    await createOrder(cookie, storeId);

    const res = await request(app)
      .get('/api/v1/orders')
      .set('Cookie', cookie)
      .set('x-store-id', storeId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('progresses order through valid state transitions and records audit events', async () => {
    const { cookie, storeId, user } = await setupStoreOwner('order_flow@example.com', 'Order Store Flow');
    const { order } = await createOrder(cookie, storeId);
    const orderId = order._id;

    // Transition: PAID -> PROCESSING
    const procRes = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ status: 'PROCESSING' });

    expect(procRes.status).toBe(200);
    expect(procRes.body.data.status).toBe('PROCESSING');

    // Transition: PROCESSING -> FULFILLED
    const fulfillRes = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ status: 'FULFILLED' });

    expect(fulfillRes.status).toBe(200);
    expect(fulfillRes.body.data.status).toBe('FULFILLED');

    // Verify order events timeline in DB
    const events = await OrderEventModel.find({ orderId });
    expect(events.length).toBeGreaterThanOrEqual(2);
    const processingEvent = events.find(e => e.toStatus === 'PROCESSING');
    expect(processingEvent!.actor).toBe(user.id);
  });

  it('rejects invalid state machine transitions with 400', async () => {
    const { cookie, storeId } = await setupStoreOwner('order_invalid@example.com', 'Order Store Invalid');
    const { order } = await createOrder(cookie, storeId);
    const orderId = order._id;

    // Attempt invalid jump directly from PAID to PENDING or arbitrary invalid state
    const invalidRes = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ status: 'PENDING' });

    expect(invalidRes.status).toBe(400);

    // Order status remains PAID
    const dbOrder = await OrderModel.findById(orderId);
    expect(dbOrder!.status).toBe('PAID');
  });

  it('restores stock automatically to inventory when order is cancelled or refunded', async () => {
    const { cookie, storeId } = await setupStoreOwner('order_cancel@example.com', 'Order Store Cancel');
    // Stock starts at 10, order deducts 3 -> leaves 7
    const { order, variantId } = await createOrder(cookie, storeId, 10, 3);
    const orderId = order._id;

    const invBefore = await InventoryModel.findOne({ storeId, variantId });
    expect(invBefore!.onHand).toBe(7);

    // Cancel order
    const cancelRes = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({ status: 'CANCELLED' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // Verify stock was restored to 10!
    const invAfter = await InventoryModel.findOne({ storeId, variantId });
    expect(invAfter!.onHand).toBe(10);
  });

  it('enforces tenant boundary on order access and transitions', async () => {
    const storeA = await setupStoreOwner('order_tenant_a@example.com', 'Store A');
    const storeB = await setupStoreOwner('order_tenant_b@example.com', 'Store B');

    const { order } = await createOrder(storeA.cookie, storeA.storeId);
    const orderId = order._id;

    // Store B tries to view Store A's order
    const crossGet = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Cookie', storeB.cookie)
      .set('x-store-id', storeB.storeId);
    expect([403, 404]).toContain(crossGet.status);

    // Store B tries to transition Store A's order
    const crossPatch = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Cookie', storeB.cookie)
      .set('x-store-id', storeB.storeId)
      .send({ status: 'CANCELLED' });
    expect([403, 404]).toContain(crossPatch.status);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { InventoryModel } from '../../src/modules/inventory/inventory.model.js';
import { OrderModel } from '../../src/modules/orders/orders.model.js';
import { ProductModel } from '../../src/modules/products/products.model.js';

describe('Checkout & Commerce Integration Tests', () => {
  async function setupStoreOwner(email: string, storeName: string) {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: 'Merchant', password: 'SecurePassword123!' });
    const cookie = authRes.headers['set-cookie'][0];

    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName, currency: 'USD' });
    const store = storeRes.body.data.store;
    const storeId = store._id || store.id;

    return { cookie, storeId, store };
  }

  async function createProductWithStock(cookie: string, storeId: string, title: string, priceCents: number, stock: number) {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        title,
        basePriceCents: priceCents,
        initialStock: stock
      });
    const productId = res.body.data._id || res.body.data.id;

    const getRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Cookie', cookie)
      .set('x-store-id', storeId);

    const variant = getRes.body.data.variants[0];
    return { productId, variantId: variant._id, priceCents };
  }

  it('calculates totals with server-authoritative pricing (ignores client-supplied prices)', async () => {
    const { cookie, storeId } = await setupStoreOwner('checkout_calc@example.com', 'Calc Store');
    const item1 = await createProductWithStock(cookie, storeId, 'Silk Scarf', 6500, 10);
    const item2 = await createProductWithStock(cookie, storeId, 'Leather Belt', 4500, 10);

    const calcRes = await request(app)
      .post('/api/v1/checkout/calculate')
      .send({
        storeId,
        items: [
          { variantId: item1.variantId, quantity: 2, priceCents: 100 }, // Spoofed price 100
          { variantId: item2.variantId, quantity: 1, priceCents: 50 }   // Spoofed price 50
        ]
      });

    expect(calcRes.status).toBe(200);
    expect(calcRes.body.success).toBe(true);
    // Real calculation: (6500 * 2) + (4500 * 1) = 13000 + 4500 = 17500
    expect(calcRes.body.data.subtotalCents).toBe(17500);
    expect(calcRes.body.data.taxCents).toBe(1400); // 8% tax
    expect(calcRes.body.data.totalCents).toBe(18900);
  });

  it('submits checkout, creates immutable order snapshot, and atomically decrements stock', async () => {
    const { cookie, storeId } = await setupStoreOwner('checkout_submit@example.com', 'Submit Store');
    const item = await createProductWithStock(cookie, storeId, 'Merino Wool Cardigan', 18000, 5);

    const submitRes = await request(app)
      .post('/api/v1/checkout/submit')
      .send({
        storeId,
        customerEmail: 'buyer@example.com',
        items: [
          { variantId: item.variantId, quantity: 2 }
        ],
        shippingAddress: {
          street: '456 Broadway',
          city: 'New York',
          state: 'NY',
          postalCode: '10013',
          country: 'US'
        }
      });

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.success).toBe(true);
    const order = submitRes.body.data.order || submitRes.body.data;
    expect(order.orderNumber).toBeDefined();
    expect(order.status).toBe('PAID');
    expect(order.subtotalCents).toBe(36000);
    expect(order.taxCents).toBe(2880);
    expect(order.totalCents).toBe(38880);
    expect(order.items.length).toBe(1);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].priceCents).toBe(18000);
    expect(order.items[0].priceCents).toBe(18000);

    // Verify stock decremented atomically: was 5, now must be 3
    const inv = await InventoryModel.findOne({ storeId, variantId: item.variantId });
    expect(inv!.onHand).toBe(3);

    // Verify order in database
    const dbOrder = await OrderModel.findOne({ orderNumber: order.orderNumber });
    expect(dbOrder).not.toBeNull();
    expect(dbOrder!.customerEmail).toBe('buyer@example.com');
  });

  it('rejects checkout when item quantity exceeds available stock', async () => {
    const { cookie, storeId } = await setupStoreOwner('checkout_oversell@example.com', 'Oversell Store');
    const item = await createProductWithStock(cookie, storeId, 'Limited Edition Print', 25000, 2);

    // Attempt to purchase 3 units when only 2 are in stock
    const submitRes = await request(app)
      .post('/api/v1/checkout/submit')
      .send({
        storeId,
        customerEmail: 'greedy@example.com',
        items: [
          { variantId: item.variantId, quantity: 3 }
        ]
      });

    expect(submitRes.status).toBe(409);
    expect(submitRes.body.error.code).toBe('CONFLICT');

    // Verify stock was NOT modified
    const inv = await InventoryModel.findOne({ storeId, variantId: item.variantId });
    expect(inv!.onHand).toBe(2);
  });

  it('rejects checkout with invalid item quantities or empty items array', async () => {
    const { cookie, storeId } = await setupStoreOwner('checkout_invalid@example.com', 'Invalid Store');
    const item = await createProductWithStock(cookie, storeId, 'Coffee Mug', 2000, 10);

    // Zero quantity
    const zeroRes = await request(app)
      .post('/api/v1/checkout/submit')
      .send({
        storeId,
        customerEmail: 'test@example.com',
        items: [{ variantId: item.variantId, quantity: 0 }]
      });
    expect(zeroRes.status).toBe(400);

    // Negative quantity
    const negRes = await request(app)
      .post('/api/v1/checkout/submit')
      .send({
        storeId,
        customerEmail: 'test@example.com',
        items: [{ variantId: item.variantId, quantity: -1 }]
      });
    expect(negRes.status).toBe(400);

    // Empty items
    const emptyRes = await request(app)
      .post('/api/v1/checkout/submit')
      .send({
        storeId,
        customerEmail: 'test@example.com',
        items: []
      });
    expect(emptyRes.status).toBe(400);
  });

  it('prevents checkout on archived products', async () => {
    const { cookie, storeId } = await setupStoreOwner('checkout_archived@example.com', 'Archived Store');
    const item = await createProductWithStock(cookie, storeId, 'Discontinued Bag', 12000, 5);

    // Archive the product in database
    await ProductModel.findByIdAndUpdate(item.productId, { status: 'ARCHIVED', isArchived: true });

    const submitRes = await request(app)
      .post('/api/v1/checkout/submit')
      .send({
        storeId,
        customerEmail: 'shopper@example.com',
        items: [{ variantId: item.variantId, quantity: 1 }]
      });

    expect(submitRes.status).toBe(400);
  });
});

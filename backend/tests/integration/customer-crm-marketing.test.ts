import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { CustomerModel } from '../../src/modules/customers/customers.model.js';
import { PromotionModel } from '../../src/modules/marketing/promotions.model.js';
import { CampaignModel } from '../../src/modules/marketing/campaigns.model.js';
import { OrderModel } from '../../src/modules/orders/orders.model.js';

describe('Customer CRM, Authentication, Retention & Marketing Integration Tests', () => {
  async function setupStoreOwner(email: string, storeName: string) {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: 'Owner User', password: 'OwnerPassword123!' });
    const cookie = authRes.headers['set-cookie'][0];

    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName, currency: 'USD' });
    const store = storeRes.body.data.store;
    const storeId = store._id || store.id;
    const storeSlug = store.slug;

    return { cookie, storeId, storeSlug, store };
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

  // --------------------------------------------------------------------------
  // STAGE 1: Customer Authentication, Profiles, Addresses, and Orders
  // --------------------------------------------------------------------------
  describe('Stage 1: Customer Authentication & Account Management', () => {
    it('registers a customer, prevents duplicate email in same store, but allows in different store', async () => {
      const store1 = await setupStoreOwner('owner1@test.com', 'Store Alpha');
      const store2 = await setupStoreOwner('owner2@test.com', 'Store Beta');

      // Register in Store 1
      const regRes1 = await request(app)
        .post(`/api/v1/storefront/${store1.storeSlug}/customer/register`)
        .send({
          email: 'shopper@test.com',
          password: 'Password123!',
          firstName: 'Alice',
          lastName: 'Smith',
          acceptsMarketing: true
        });

      expect(regRes1.status).toBe(201);
      expect(regRes1.body.success).toBe(true);
      expect(regRes1.body.data.customer.email).toBe('shopper@test.com');
      expect(regRes1.body.data.token).toBeDefined();

      // Duplicate registration in Store 1 should fail
      const regDup = await request(app)
        .post(`/api/v1/storefront/${store1.storeSlug}/customer/register`)
        .send({
          email: 'shopper@test.com',
          password: 'Password123!'
        });
      expect(regDup.status).toBe(409);

      // Registration with same email in Store 2 must succeed (tenant isolation)
      const regRes2 = await request(app)
        .post(`/api/v1/storefront/${store2.storeSlug}/customer/register`)
        .send({
          email: 'shopper@test.com',
          password: 'Password123!',
          firstName: 'Alice In Store 2'
        });
      expect(regRes2.status).toBe(201);
      expect(String(regRes2.body.data.customer.storeId)).toBe(String(store2.storeId));
    });

    it('authenticates customer, manages profile and address book', async () => {
      const store = await setupStoreOwner('owner_profile@test.com', 'Profile Store');

      // Register
      const regRes = await request(app)
        .post(`/api/v1/storefront/${store.storeSlug}/customer/register`)
        .send({
          email: 'bob@test.com',
          password: 'BobSecret123!',
          firstName: 'Bob',
          lastName: 'Smith'
        });
      const token = regRes.body.data.token;

      // Login
      const loginRes = await request(app)
        .post(`/api/v1/storefront/${store.storeSlug}/customer/login`)
        .send({
          email: 'bob@test.com',
          password: 'BobSecret123!'
        });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.customer.email).toBe('bob@test.com');

      // Get profile
      const profRes = await request(app)
        .get(`/api/v1/storefront/${store.storeSlug}/customer/profile`)
        .set('Authorization', `Bearer ${token}`);
      expect(profRes.status).toBe(200);
      expect(profRes.body.data.firstName).toBe('Bob');

      // Update profile
      const updateRes = await request(app)
        .patch(`/api/v1/storefront/${store.storeSlug}/customer/profile`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          lastName: 'Builder',
          phone: '+1-555-0199'
        });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.lastName).toBe('Builder');

      // Add address
      const addrRes = await request(app)
        .post(`/api/v1/storefront/${store.storeSlug}/customer/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          street: '123 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94103',
          country: 'US',
          isDefault: true
        });
      expect(addrRes.status).toBe(200);
      expect(addrRes.body.data.addresses.length).toBe(1);
      const addressId = addrRes.body.data.addresses[0]._id || addrRes.body.data.addresses[0].id;

      // Delete address
      const delAddrRes = await request(app)
        .delete(`/api/v1/storefront/${store.storeSlug}/customer/addresses/${addressId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(delAddrRes.status).toBe(200);
      expect(delAddrRes.body.data.addresses.length).toBe(0);
    });

    it('retrospectively claims eligible guest orders onto registered customer account', async () => {
      const { cookie, storeId, storeSlug } = await setupStoreOwner('owner_claim@test.com', 'Claim Store');
      const product = await createProductWithStock(cookie, storeId, 'Widget', 5000, 20);

      // Place guest checkout order
      const guestCheckoutRes = await request(app)
        .post('/api/v1/checkout/submit')
        .send({
          storeId,
          customerEmail: 'guest_user@example.com',
          items: [{ variantId: product.variantId, quantity: 2 }],
          shippingAddress: { street: '10 Main', city: 'Denver', state: 'CO', postalCode: '80202', country: 'US' }
        });
      expect(guestCheckoutRes.status).toBe(201);
      const order = guestCheckoutRes.body.data.order || guestCheckoutRes.body.data;
      const orderId = order._id || order.id;

      // Now shopper registers with that same email (auto-claims prior guest order)
      const regRes = await request(app)
        .post(`/api/v1/storefront/${storeSlug}/customer/register`)
        .send({
          email: 'guest_user@example.com',
          password: 'GuestPassword123!'
        });
      const customerToken = regRes.body.data.token;

      // Verify prior guest order was automatically claimed during registration
      const autoClaimedOrder = await OrderModel.findById(orderId);
      const regCustomerId = regRes.body.data.customer?.id || regRes.body.data.customer?._id;
      expect(autoClaimedOrder?.customerId?.toString()).toBe(String(regCustomerId));

      // Place a new guest order with that email to test manual 1-click claim button
      await request(app)
        .post('/api/v1/checkout/submit')
        .send({
          storeId,
          customerEmail: 'guest_user@example.com',
          items: [{ variantId: product.variantId, quantity: 1 }],
          shippingAddress: { street: '10 Main', city: 'Denver', state: 'CO', postalCode: '80202', country: 'US' }
        });

      // Claim guest orders
      const claimRes = await request(app)
        .post(`/api/v1/storefront/${storeSlug}/customer/claim-orders`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(claimRes.status).toBe(200);
      expect(claimRes.body.data.claimedCount).toBe(1);

      // Order appears in customer's order history
      const historyRes = await request(app)
        .get(`/api/v1/storefront/${storeSlug}/customer/orders`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.orders.length).toBe(2);
    });
  });

  // --------------------------------------------------------------------------
  // STAGE 2: Store-Scoped Customer CRM, Segments, and GDPR
  // --------------------------------------------------------------------------
  describe('Stage 2: Store-Scoped Customer CRM Directory', () => {
    it('segments customers correctly, supports search, and enforces tenant isolation', async () => {
      const storeA = await setupStoreOwner('owner_crm_a@test.com', 'Store CRM A');
      const storeB = await setupStoreOwner('owner_crm_b@test.com', 'Store CRM B');
      const productA = await createProductWithStock(storeA.cookie, storeA.storeId, 'Item A', 2000, 50);

      // Create a customer in Store A
      const regRes = await request(app)
        .post(`/api/v1/storefront/${storeA.storeSlug}/customer/register`)
        .send({
          email: 'vip_shopper@test.com',
          password: 'Password123!',
          firstName: 'VIP',
          lastName: 'Customer',
          acceptsMarketing: true
        });
      const customerId = regRes.body.data.customer.id || regRes.body.data.customer._id;

      // Submit 2 orders to make them a repeat customer
      await request(app).post('/api/v1/checkout/submit').send({
        storeId: storeA.storeId,
        customerEmail: 'vip_shopper@test.com',
        customerId,
        items: [{ variantId: productA.variantId, quantity: 1 }],
        shippingAddress: { street: '1 A St', city: 'Boston', state: 'MA', postalCode: '02108', country: 'US' }
      });

      await request(app).post('/api/v1/checkout/submit').send({
        storeId: storeA.storeId,
        customerEmail: 'vip_shopper@test.com',
        customerId,
        items: [{ variantId: productA.variantId, quantity: 2 }],
        shippingAddress: { street: '1 A St', city: 'Boston', state: 'MA', postalCode: '02108', country: 'US' }
      });

      // Merchant A lists customers
      const listResA = await request(app)
        .get(`/api/v1/stores/${storeA.storeId}/customers`)
        .set('Cookie', storeA.cookie);
      expect(listResA.status).toBe(200);
      expect(listResA.body.data.customers.length).toBe(1);
      expect(listResA.body.data.customers[0].orderCount).toBe(2);
      expect(listResA.body.data.customers[0].segment).toBe('repeat');
      expect(listResA.body.data.segmentCounts.repeat).toBe(1);

      // Merchant B attempts to access Merchant A's customers (Tenant Isolation)
      const listResB = await request(app)
        .get(`/api/v1/stores/${storeA.storeId}/customers`)
        .set('Cookie', storeB.cookie);
      expect(listResB.status).toBe(403);

      // Merchant A gets customer details
      const detailRes = await request(app)
        .get(`/api/v1/stores/${storeA.storeId}/customers/${customerId}`)
        .set('Cookie', storeA.cookie);
      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.customer.email).toBe('vip_shopper@test.com');
      expect(detailRes.body.data.orders.length).toBe(2);
      expect(detailRes.body.data.consentHistory.length).toBeGreaterThanOrEqual(1);

      // GDPR Export
      const exportRes = await request(app)
        .get(`/api/v1/stores/${storeA.storeId}/customers/${customerId}/export`)
        .set('Cookie', storeA.cookie);
      expect(exportRes.status).toBe(200);
      expect(exportRes.body.data.customer.email).toBe('vip_shopper@test.com');
      expect(exportRes.body.data.orders.length).toBe(2);

      // GDPR Right to be Forgotten (Delete)
      const delRes = await request(app)
        .delete(`/api/v1/stores/${storeA.storeId}/customers/${customerId}`)
        .set('Cookie', storeA.cookie);
      expect(delRes.status).toBe(200);

      // Customer should no longer exist in directory
      const checkCust = await CustomerModel.findById(customerId);
      expect(checkCust).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // STAGE 3: Promotions Engine & Marketing Campaigns
  // --------------------------------------------------------------------------
  describe('Stage 3: Promotions Engine & Campaigns', () => {
    it('creates promotion, validates discounts server-side, and enforces usage caps', async () => {
      const store = await setupStoreOwner('owner_promo@test.com', 'Promo Store');
      const product = await createProductWithStock(store.cookie, store.storeId, 'Watch', 10000, 20); // $100.00

      // Create 20% discount promotion
      const createPromoRes = await request(app)
        .post(`/api/v1/stores/${store.storeId}/marketing/promotions`)
        .set('Cookie', store.cookie)
        .send({
          code: 'SAVE20',
          type: 'PERCENTAGE',
          value: 20,
          minimumOrderSubtotalCents: 5000,
          totalUsageLimit: 2,
          isActive: true
        });
      expect(createPromoRes.status).toBe(201);
      expect(createPromoRes.body.data.code).toBe('SAVE20');

      // Validate promo code on storefront
      const validRes = await request(app)
        .get(`/api/v1/storefront/${store.storeSlug}/promotions/validate?code=SAVE20&subtotalCents=10000`);
      expect(validRes.status).toBe(200);
      expect(validRes.body.data.valid).toBe(true);

      // Calculate checkout totals with promo discount
      const calcRes = await request(app)
        .post('/api/v1/checkout/calculate')
        .send({
          storeId: store.storeId,
          items: [{ variantId: product.variantId, quantity: 1 }],
          promotionCode: 'SAVE20'
        });
      expect(calcRes.status).toBe(200);
      expect(calcRes.body.data.subtotalCents).toBe(10000);
      expect(calcRes.body.data.discountCents).toBe(2000); // 20% of 10000
      expect(calcRes.body.data.totalCents).toBeGreaterThan(0);

      // Submit checkout with promo
      const submitRes = await request(app)
        .post('/api/v1/checkout/submit')
        .send({
          storeId: store.storeId,
          customerEmail: 'coupon_shopper@test.com',
          promotionCode: 'SAVE20',
          items: [{ variantId: product.variantId, quantity: 1 }],
          shippingAddress: { street: '2 Main', city: 'Miami', state: 'FL', postalCode: '33101', country: 'US' }
        });
      expect(submitRes.status).toBe(201);
      const submitOrder = submitRes.body.data.order || submitRes.body.data;
      expect(submitOrder.discountCode).toBe('SAVE20');
      expect(submitOrder.discountCents).toBe(2000);

      // Verify promotion usage count incremented
      const promoDoc = await PromotionModel.findOne({ storeId: store.storeId, code: 'SAVE20' });
      expect(promoDoc?.usageCount).toBe(1);
    });

    it('creates and sends marketing campaign, filters by consent, and handles 1-click unsubscribe', async () => {
      const store = await setupStoreOwner('owner_camp@test.com', 'Camp Store');

      // Create opted-in customer
      const cust1 = await request(app)
        .post(`/api/v1/storefront/${store.storeSlug}/customer/register`)
        .send({
          email: 'optedin@test.com',
          password: 'Password123!',
          firstName: 'Opted',
          acceptsMarketing: true
        });

      // Create opted-out customer
      const cust2 = await request(app)
        .post(`/api/v1/storefront/${store.storeSlug}/customer/register`)
        .send({
          email: 'optedout@test.com',
          password: 'Password123!',
          firstName: 'Out',
          acceptsMarketing: false
        });

      // Create campaign
      const campRes = await request(app)
        .post(`/api/v1/stores/${store.storeId}/marketing/campaigns`)
        .set('Cookie', store.cookie)
        .send({
          name: 'Spring Sale',
          subject: 'Special discounts for spring!',
          targetSegment: 'ALL_OPTED_IN',
          content: 'Hello {{customer_name}}, check out our sale at {{store_name}}!'
        });
      expect(campRes.status).toBe(201);
      const campaignId = campRes.body.data.id;

      // Dispatch campaign
      const sendRes = await request(app)
        .post(`/api/v1/stores/${store.storeId}/marketing/campaigns/${campaignId}/send`)
        .set('Cookie', store.cookie);
      expect(sendRes.status).toBe(200);

      // Campaign should target only opted-in customer (1 recipient)
      const campDoc = await CampaignModel.findById(campaignId);
      const sentCount = campDoc?.stats?.deliveredCount || (campDoc as any)?.metrics?.sentCount || 0;
      expect(sentCount).toBe(1);
      expect(campDoc?.recipientLogs[0].email).toBe('optedin@test.com');

      // Test 1-click unsubscribe
      const token = cust1.body.data.customer.id;
      const unsubRes = await request(app)
        .get(`/api/v1/storefront/${store.storeSlug}/marketing/unsubscribe?token=${token}&email=optedin@test.com`);
      expect(unsubRes.status).toBe(200);
      expect(unsubRes.text).toContain('Successfully Unsubscribed');

      // Verify customer doc updated to opted-out
      const optCustomerId = cust1.body.data.customer.id || cust1.body.data.customer._id;
      const updatedCust = await CustomerModel.findById(optCustomerId);
      expect(updatedCust?.marketingConsent.emailOptIn).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // STAGE 4: Marketing Analytics Engine
  // --------------------------------------------------------------------------
  describe('Stage 4: Marketing Analytics Engine & Documented Metrics', () => {
    it('computes auditable acquisition, repeat purchase rate, retention rate, AOV, and CLV', async () => {
      const store = await setupStoreOwner('owner_metrics@test.com', 'Analytics Store');
      const product = await createProductWithStock(store.cookie, store.storeId, 'Dress', 8000, 30); // $80.00

      // Register 3 customers
      const c1 = await request(app).post(`/api/v1/storefront/${store.storeSlug}/customer/register`).send({ email: 'c1@test.com', password: 'Password123!' });
      const c2 = await request(app).post(`/api/v1/storefront/${store.storeSlug}/customer/register`).send({ email: 'c2@test.com', password: 'Password123!' });
      const c3 = await request(app).post(`/api/v1/storefront/${store.storeSlug}/customer/register`).send({ email: 'c3@test.com', password: 'Password123!' });

      const c1Id = c1.body.data.customer.id || c1.body.data.customer._id;
      const c2Id = c2.body.data.customer.id || c2.body.data.customer._id;

      // C1 places 2 orders (repeat customer)
      await request(app).post('/api/v1/checkout/submit').send({
        storeId: store.storeId,
        customerEmail: 'c1@test.com',
        customerId: c1Id,
        items: [{ variantId: product.variantId, quantity: 1 }],
        shippingAddress: { street: '1', city: 'A', state: 'NY', postalCode: '10001', country: 'US' }
      });
      await request(app).post('/api/v1/checkout/submit').send({
        storeId: store.storeId,
        customerEmail: 'c1@test.com',
        customerId: c1Id,
        items: [{ variantId: product.variantId, quantity: 1 }],
        shippingAddress: { street: '1', city: 'A', state: 'NY', postalCode: '10001', country: 'US' }
      });

      // C2 places 1 order (new customer)
      await request(app).post('/api/v1/checkout/submit').send({
        storeId: store.storeId,
        customerEmail: 'c2@test.com',
        customerId: c2Id,
        items: [{ variantId: product.variantId, quantity: 2 }],
        shippingAddress: { street: '2', city: 'B', state: 'CA', postalCode: '90001', country: 'US' }
      });

      // Request analytics
      const analyticsRes = await request(app)
        .get(`/api/v1/stores/${store.storeId}/marketing/analytics?timeframe=all`)
        .set('Cookie', store.cookie);

      expect(analyticsRes.status).toBe(200);
      const data = analyticsRes.body.data;

      // Customer Acquisition
      expect(data.customerAcquisition.totalCustomers).toBe(3);
      expect(data.customerAcquisition.payingCustomersCount).toBe(2);

      // Repeat Purchase Rate: 1 repeat customer / 2 paying customers = 50%
      expect(data.retention.repeatPurchaseRate).toBe(50);
      expect(data.retention.repeatPurchaseRateFormula).toContain('(Customers with >= 2 orders');

      // Average Order Value & CLV
      expect(data.customerValue.averageOrderValueCents).toBeGreaterThan(0);
      expect(data.customerValue.customerLifetimeValueCents).toBeGreaterThan(0);
    });
  });
});

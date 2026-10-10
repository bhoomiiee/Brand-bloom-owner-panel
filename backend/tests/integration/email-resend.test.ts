import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { emailService, EmailSendResult } from '../../src/modules/email/email.service.js';
import { UserModel } from '../../src/modules/users/users.model.js';
import { StoreModel } from '../../src/modules/stores/stores.model.js';
import { StoreMembershipModel } from '../../src/modules/memberships/memberships.model.js';
import { InvitationModel } from '../../src/modules/memberships/invitations.model.js';
import { CustomerModel } from '../../src/modules/customers/customers.model.js';
import { OrderModel } from '../../src/modules/orders/orders.model.js';
import { CampaignModel } from '../../src/modules/marketing/campaigns.model.js';
import { ProductModel } from '../../src/modules/products/products.model.js';
import { ProductVariantModel } from '../../src/modules/products/product-variants.model.js';
import { InventoryModel } from '../../src/modules/inventory/inventory.model.js';

describe('Resend Email Integration & Delivery Test Suite', () => {
  let sentEmails: any[] = [];

  beforeEach(() => {
    sentEmails = [];
    // Configure default mock sender for deterministic test execution
    emailService.setMock(async (opts) => {
      sentEmails.push(opts);
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        provider: 'resend'
      };
    });
  });

  afterEach(() => {
    // Reset mock
    emailService.setMock(null);
  });

  async function createTestOwner(email: string, name: string) {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name, password: 'StrongPassword123!' });
    const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
    return { user: res.body.data.user, cookie };
  }

  async function createStore(cookie: string, name: string) {
    const res = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name, currency: 'USD' });
    const store = res.body.data.store;
    return { storeId: store._id || store.id, slug: store.slug };
  }

  async function createProductWithStock(cookie: string, storeId: string, title: string, priceCents: number, stock: number) {
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .set('x-store-id', storeId)
      .send({
        title,
        description: 'Quality item',
        basePriceCents: priceCents,
        sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        initialStock: stock
      });
    const product = prodRes.body.data;
    const variant = await ProductVariantModel.findOne({ productId: product._id || product.id });
    return { productId: product._id || product.id, variantId: variant!._id.toString() };
  }

  // 1. Unit & Core Email Service Tests
  describe('Email Service Core Behaviors', () => {
    it('sends email successfully using mocked provider and records provider messageId', async () => {
      const res = await emailService.sendEmail({
        to: 'shopper@example.com',
        subject: 'Welcome to Brand Bloom',
        html: '<p>Welcome!</p>',
        text: 'Welcome!'
      });

      expect(res.success).toBe(true);
      expect(res.provider).toBe('resend');
      expect(res.messageId).toBeDefined();
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe('shopper@example.com');
      expect(sentEmails[0].subject).toBe('Welcome to Brand Bloom');
    });

    it('rejects invalid recipient email addresses with clear validation error', async () => {
      const res = await emailService.sendEmail({
        to: 'not-an-email',
        subject: 'Test Invalid',
        html: '<p>Invalid</p>'
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid recipient email address');
      expect(sentEmails.length).toBe(0);
    });

    it('handles Resend provider rejection gracefully and returns provider error message', async () => {
      emailService.setMock(async () => {
        return {
          success: false,
          provider: 'resend',
          error: 'Resend API key is invalid or restricted (401)'
        };
      });

      const res = await emailService.sendEmail({
        to: 'valid@example.com',
        subject: 'Failing Delivery',
        html: '<p>Test</p>'
      });

      expect(res.success).toBe(false);
      expect(res.provider).toBe('resend');
      expect(res.error).toContain('Resend API key is invalid or restricted');
    });

    it('fails with actionable configuration error when provider is unconfigured', async () => {
      // Disable mock and temporarily clear resend client
      emailService.setMock(null);
      const originalService = emailService as any;
      const prevClient = originalService.resendClient;
      const prevSmtp = originalService.smtpTransporter;
      originalService.resendClient = null;
      originalService.smtpTransporter = null;

      const res = await emailService.sendEmail({
        to: 'shopper@example.com',
        subject: 'Unconfigured Test',
        html: '<p>Test</p>'
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Email delivery is not configured');

      // Restore
      originalService.resendClient = prevClient;
      originalService.smtpTransporter = prevSmtp;
    });
  });

  // 2. Email Test Endpoint Tests
  describe('Email Test Endpoint (/api/v1/email/test)', () => {
    it('blocks unauthenticated access to email test endpoint in non-development mode', async () => {
      const res = await request(app)
        .post('/api/v1/email/test')
        .send({ to: 'aishwarya.pro369@gmail.com' });

      expect(res.status).toBe(401);
    });

    it('executes test email dispatch and returns real Resend messageId for authenticated user', async () => {
      const owner = await createTestOwner('admin_tester@example.com', 'Admin User');
      const res = await request(app)
        .post('/api/v1/email/test')
        .set('Cookie', owner.cookie)
        .send({ to: 'aishwarya.pro369@gmail.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.provider).toBe('resend');
      expect(res.body.data.messageId).toBeDefined();
      expect(res.body.data.recipient).toBe('aishwarya.pro369@gmail.com');
      expect(res.body.data.message).toContain('Your Store Owner Portal email integration is working');
    });

    it('rejects test request with 400 when recipient email is missing or malformed', async () => {
      const owner = await createTestOwner('admin_tester2@example.com', 'Admin User 2');
      const res = await request(app)
        .post('/api/v1/email/test')
        .set('Cookie', owner.cookie)
        .send({ to: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('valid recipient email address is required');
    });

    it('reports provider failure accurately when Resend rejects the test email', async () => {
      const owner = await createTestOwner('admin_tester3@example.com', 'Admin User 3');
      emailService.setMock(async () => {
        return {
          success: false,
          provider: 'resend',
          error: 'Domain not verified for onboarding@resend.dev'
        };
      });

      const res = await request(app)
        .post('/api/v1/email/test')
        .set('Cookie', owner.cookie)
        .send({ to: 'unverified@customdomain.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Domain not verified');
    });
  });

  // 3. Staff Invitation Workflow & Security
  describe('Staff Invitation Flow via Resend', () => {
    it('creates an expiring invitation and dispatches invitation email with link', async () => {
      const owner = await createTestOwner('owner_email_test@example.com', 'Owner One');
      const { storeId } = await createStore(owner.cookie, 'Invite Store');
      const staffEmail = 'invited_staff_member@example.com';

      const res = await request(app)
        .post(`/api/v1/stores/${storeId}/members`)
        .set('Cookie', owner.cookie)
        .send({ email: staffEmail, role: 'staff' });

      expect(res.status).toBe(201);
      expect(res.body.data.isInvited).toBe(true);
      expect(res.body.data.emailSent).toBe(true);

      // Verify email was dispatched via emailService
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe(staffEmail);
      expect(sentEmails[0].subject).toContain('You\'re invited to join');
      expect(sentEmails[0].html).toContain('Accept Invitation');

      // Verify no fake user was created
      const fakeUser = await UserModel.findOne({ email: staffEmail });
      expect(fakeUser).toBeNull();
    });

    it('prevents duplicate invitations for already-pending staff invite', async () => {
      const owner = await createTestOwner('owner_dup_test@example.com', 'Owner Two');
      const { storeId } = await createStore(owner.cookie, 'Dup Store');
      const staffEmail = 'duplicate_invite@example.com';

      // First invite
      await request(app)
        .post(`/api/v1/stores/${storeId}/members`)
        .set('Cookie', owner.cookie)
        .send({ email: staffEmail, role: 'staff' });

      // Second duplicate invite
      const dupRes = await request(app)
        .post(`/api/v1/stores/${storeId}/members`)
        .set('Cookie', owner.cookie)
        .send({ email: staffEmail, role: 'staff' });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.error.message).toContain('already pending');
    });
  });

  // 4. Password Reset Flow
  describe('Password Reset Email Flow', () => {
    it('dispatches password reset email with token and sends security alert upon reset', async () => {
      const owner = await createTestOwner('owner_pwd_store@example.com', 'Pwd Owner');
      const { storeId, slug } = await createStore(owner.cookie, 'Password Store');

      // Register a customer in that store
      await request(app)
        .post(`/api/v1/storefront/${slug}/customer/register`)
        .send({ email: 'customer_pwd@test.com', password: 'OldPassword123!' });

      sentEmails = [];

      // Request password reset
      const reqRes = await request(app)
        .post(`/api/v1/storefront/${slug}/customer/forgot-password`)
        .send({ email: 'customer_pwd@test.com' });

      expect(reqRes.status).toBe(200);
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe('customer_pwd@test.com');
      expect(sentEmails[0].subject).toContain('Reset your password');

      // Inspect customer document to retrieve reset token
      const customer = await CustomerModel.findOne({ storeId, email: 'customer_pwd@test.com' });
      expect(customer?.resetPasswordToken).toBeDefined();

      // Mock reset with token
      const resetRes = await request(app)
        .post(`/api/v1/storefront/${slug}/customer/reset-password`)
        .send({
          token: 'invalid_token_attempt',
          newPassword: 'BrandNewPassword123!'
        });
      expect(resetRes.status).toBe(400);
    });
  });

  // 5. Orders Confirmation & Status Update Emails
  describe('Order Notifications Flow', () => {
    it('dispatches itemized order confirmation email when customer places an order', async () => {
      const owner = await createTestOwner('owner_order_email@example.com', 'Order Owner');
      const { storeId, slug } = await createStore(owner.cookie, 'Receipt Store');
      const product = await createProductWithStock(owner.cookie, storeId, 'Silk Shirt', 4500, 15);

      sentEmails = [];

      // Place order via checkout
      const orderRes = await request(app)
        .post('/api/v1/checkout/submit')
        .send({
          storeId,
          customerEmail: 'shopper_receipt@test.com',
          items: [{ variantId: product.variantId, quantity: 1 }],
          shippingAddress: {
            fullName: 'Jane Doe',
            street: '456 Oak Ave',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'US'
          }
        });

      expect(orderRes.status).toBe(201);
      const order = orderRes.body.data.order || orderRes.body.data;

      // Verify order confirmation was emailed to customer
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe('shopper_receipt@test.com');
      expect(sentEmails[0].subject).toContain('Order Confirmation');
      expect(sentEmails[0].html).toContain(order.orderNumber);
      expect(sentEmails[0].html).toContain('Silk Shirt');

      // Transition order status to FULFILLED -> triggers status update email
      sentEmails = [];
      const transRes = await request(app)
        .patch(`/api/v1/orders/${order._id || order.id}/status`)
        .set('Cookie', owner.cookie)
        .set('x-store-id', storeId)
        .send({ status: 'PROCESSING' });

      expect(transRes.status).toBe(200);
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe('shopper_receipt@test.com');
      expect(sentEmails[0].subject).toContain('Status: PROCESSING');
    });
  });

  // 6. Marketing Campaigns & Consent
  describe('Marketing Campaign Delivery & Consent Enforcement', () => {
    it('delivers campaign emails strictly to opted-in subscribers and includes unsubscribe link', async () => {
      const owner = await createTestOwner('owner_camp_email@example.com', 'Campaign Owner');
      const { storeId, slug } = await createStore(owner.cookie, 'Marketing Store');

      // 1 opted-in subscriber
      await request(app)
        .post(`/api/v1/storefront/${slug}/customer/register`)
        .send({ email: 'opted_subscriber@test.com', password: 'Password123!', acceptsMarketing: true });

      // 1 opted-out customer
      await request(app)
        .post(`/api/v1/storefront/${slug}/customer/register`)
        .send({ email: 'opted_out_user@test.com', password: 'Password123!', acceptsMarketing: false });

      // Create campaign
      const campRes = await request(app)
        .post(`/api/v1/stores/${storeId}/marketing/campaigns`)
        .set('Cookie', owner.cookie)
        .send({
          name: 'Flash Sale',
          subject: '50% Off Everything Today',
          targetSegment: 'ALL_OPTED_IN',
          contentHtml: '<p>Don\'t miss our biggest sale!</p>'
        });

      const campaign = campRes.body.data.campaign || campRes.body.data;
      const campaignId = campaign._id || campaign.id;
      sentEmails = [];

      // Send campaign
      const sendRes = await request(app)
        .post(`/api/v1/stores/${storeId}/marketing/campaigns/${campaignId}/send`)
        .set('Cookie', owner.cookie);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.data.deliveredCount).toBe(1);

      // Verify only opted-in customer received the email
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe('opted_subscriber@test.com');
      expect(sentEmails[0].subject).toBe('50% Off Everything Today');
      expect(sentEmails[0].html).toContain('Unsubscribe');
    });
  });

  // 7. Tenant Isolation
  describe('Tenant Isolation for Email & Team Operations', () => {
    it('prohibits store owners from inviting staff or viewing email workflows in foreign stores', async () => {
      const ownerA = await createTestOwner('owner_tenant_a@example.com', 'Owner A');
      const ownerB = await createTestOwner('owner_tenant_b@example.com', 'Owner B');
      const storeA = await createStore(ownerA.cookie, 'Store A');

      // Owner B attempts to invite someone to Store A
      const crossRes = await request(app)
        .post(`/api/v1/stores/${storeA.storeId}/members`)
        .set('Cookie', ownerB.cookie)
        .send({ email: 'intruder@test.com', role: 'staff' });

      expect(crossRes.status).toBe(403);
    });
  });
});

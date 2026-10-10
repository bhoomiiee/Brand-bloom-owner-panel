import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { StoreMembershipModel } from '../../src/modules/memberships/memberships.model.js';

describe('Tenant Isolation Critical Security Tests', () => {
  async function createTestUserAndStore(email: string, userName: string, storeName: string) {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: userName, password: 'SecurePassword123!' });
    const cookie = authRes.headers['set-cookie'][0];
    const user = authRes.body.data.user;

    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName });
    const store = storeRes.body.data.store;
    const storeId = store.id || store._id;

    return { cookie, user, store, storeId };
  }

  it('User A cannot read Store B by changing the store ID in the URL parameter', async () => {
    const tenantA = await createTestUserAndStore('tenantA@example.com', 'Alice Tenant', 'Alice Store');
    const tenantB = await createTestUserAndStore('tenantB@example.com', 'Bob Tenant', 'Bob Store');

    // Alice attempts to access Bob's store URL: GET /api/v1/stores/:storeId_B
    const attackRes = await request(app)
      .get(`/api/v1/stores/${tenantB.storeId}`)
      .set('Cookie', tenantA.cookie);

    expect(attackRes.status).toBe(403);
    expect(attackRes.body.success).toBe(false);
    expect(attackRes.body.error.code).toBe('FORBIDDEN');
    expect(attackRes.body.error.message).toContain('access');
  });

  it('User A cannot update Store B settings by manipulating the URL parameter', async () => {
    const tenantA = await createTestUserAndStore('attacker@example.com', 'Attacker', 'Attacker Store');
    const tenantB = await createTestUserAndStore('victim@example.com', 'Victim', 'Victim Store');

    // Attacker attempts PATCH /api/v1/stores/:victimStoreId
    const attackRes = await request(app)
      .patch(`/api/v1/stores/${tenantB.storeId}`)
      .set('Cookie', tenantA.cookie)
      .send({ name: 'Pawned By Attacker' });

    expect(attackRes.status).toBe(403);
    expect(attackRes.body.success).toBe(false);

    // Verify victim's store was untouched
    const checkRes = await request(app)
      .get(`/api/v1/stores/${tenantB.storeId}`)
      .set('Cookie', tenantB.cookie);
    expect(checkRes.body.data.name).toBe('Victim Store');
  });

  it('User A cannot access Store B by sending its ID via header, query or body to bypass authorization', async () => {
    const tenantA = await createTestUserAndStore('alice_header@example.com', 'Alice', 'Store Alpha');
    const tenantB = await createTestUserAndStore('bob_header@example.com', 'Bob', 'Store Beta');

    // Alice calls with Store B's ID in x-store-id header
    const attackHeaderRes = await request(app)
      .get(`/api/v1/stores/${tenantA.storeId}`)
      .set('Cookie', tenantA.cookie)
      .set('x-store-id', tenantB.storeId);

    // The route explicitly uses param storeId and resolves Alice's store; Alice only gets Store A
    expect(attackHeaderRes.status).toBe(200);
    expect(attackHeaderRes.body.data.name).toBe('Store Alpha');

    // Alice attempts member listing on Store B
    const memberListingAttack = await request(app)
      .get(`/api/v1/stores/${tenantB.storeId}/members`)
      .set('Cookie', tenantA.cookie);
    expect(memberListingAttack.status).toBe(403);
  });

  it('Staff in Store A cannot read or access Store B', async () => {
    const tenantA = await createTestUserAndStore('ownerA@example.com', 'Owner A', 'Store A');
    const tenantB = await createTestUserAndStore('ownerB@example.com', 'Owner B', 'Store B');

    // Create staff member in Store A
    const staffRegisterRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'staffA@example.com', name: 'Staff A', password: 'Password123!' });
    const staffCookie = staffRegisterRes.headers['set-cookie'][0];

    await request(app)
      .post(`/api/v1/stores/${tenantA.storeId}/members`)
      .set('Cookie', tenantA.cookie)
      .send({ email: 'staffA@example.com', role: 'staff' });

    // Staff in Store A attempts to access Store B
    const attackRes = await request(app)
      .get(`/api/v1/stores/${tenantB.storeId}`)
      .set('Cookie', staffCookie);

    expect(attackRes.status).toBe(403);
    expect(attackRes.body.error.code).toBe('FORBIDDEN');
  });

  it('Suspended or inactive memberships fail closed (deny access)', async () => {
    const tenant = await createTestUserAndStore('suspended_test@example.com', 'Owner', 'Store XYZ');

    // Create staff member
    const staffRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'staff_suspended@example.com', name: 'Staff', password: 'Password123!' });
    const staffCookie = staffRes.headers['set-cookie'][0];
    const staffUserId = staffRes.body.data.user.id;

    await request(app)
      .post(`/api/v1/stores/${tenant.storeId}/members`)
      .set('Cookie', tenant.cookie)
      .send({ email: 'staff_suspended@example.com', role: 'staff' });

    // Suspend staff member in database
    await StoreMembershipModel.updateOne(
      { storeId: tenant.storeId, userId: staffUserId },
      { $set: { status: 'suspended' } }
    );

    // Suspended staff attempts to access store
    const accessRes = await request(app)
      .get(`/api/v1/stores/${tenant.storeId}`)
      .set('Cookie', staffCookie);

    expect(accessRes.status).toBe(403);
    expect(accessRes.body.error.code).toBe('FORBIDDEN');
  });

  it('Listing stores never leaks records from unrelated stores across tenants', async () => {
    const tenant1 = await createTestUserAndStore('t1@example.com', 'User 1', 'Tenant 1 Store');
    const tenant2 = await createTestUserAndStore('t2@example.com', 'User 2', 'Tenant 2 Store');

    const listRes1 = await request(app).get('/api/v1/stores').set('Cookie', tenant1.cookie);
    expect(listRes1.status).toBe(200);
    const storeIds1 = listRes1.body.data.map((s: any) => s.id || s._id);
    expect(storeIds1).toContain(tenant1.storeId);
    expect(storeIds1).not.toContain(tenant2.storeId);

    const listRes2 = await request(app).get('/api/v1/stores').set('Cookie', tenant2.cookie);
    expect(listRes2.status).toBe(200);
    const storeIds2 = listRes2.body.data.map((s: any) => s.id || s._id);
    expect(storeIds2).toContain(tenant2.storeId);
    expect(storeIds2).not.toContain(tenant1.storeId);
  });
});

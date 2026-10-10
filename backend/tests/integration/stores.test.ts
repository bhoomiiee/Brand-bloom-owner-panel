import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { StoreModel } from '../../src/modules/stores/stores.model.js';
import { StoreMembershipModel } from '../../src/modules/memberships/memberships.model.js';
import { UserModel } from '../../src/modules/users/users.model.js';

describe('Store Management & RBAC Integration Tests', () => {
  async function createTestUser(email: string, name: string) {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name, password: 'SecurePassword123!' });
    return {
      cookie: res.headers['set-cookie'][0],
      user: res.body.data.user
    };
  }

  it('authenticated user can create a store and receives owner membership atomically', async () => {
    const { cookie, user } = await createTestUser('owner1@example.com', 'Owner One');

    const res = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({
        name: 'Alpha Boutique',
        businessType: 'retail',
        address: {
          street: '100 Main St',
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        },
        currency: 'USD'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.store).toBeDefined();
    expect(res.body.data.store.name).toBe('Alpha Boutique');
    expect(res.body.data.store.slug).toBe('alpha-boutique');
    expect(res.body.data.role).toBe('owner');

    const storeId = res.body.data.store.id || res.body.data.store._id;

    // Verify creator in DB is the authenticated user, NOT any client-supplied id
    const dbStore = await StoreModel.findById(storeId);
    expect(dbStore).not.toBeNull();
    expect(dbStore!.createdBy.toString()).toBe(user.id);

    // Verify owner membership was created atomically
    const membership = await StoreMembershipModel.findOne({ storeId, userId: user.id });
    expect(membership).not.toBeNull();
    expect(membership!.role).toBe('owner');
    expect(membership!.status).toBe('active');
  });

  it('client cannot override server identity with spoofed createdBy or userId', async () => {
    const { cookie, user } = await createTestUser('spoof@example.com', 'Spoof User');

    const res = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({
        name: 'Spoofed Store',
        createdBy: '65e000000000000000000000', // Attempt to spoof createdBy
        userId: '65e000000000000000000000',
        role: 'staff' // Attempt to spoof role
      });

    expect(res.status).toBe(201);
    const storeId = res.body.data.store.id || res.body.data.store._id;
    const dbStore = await StoreModel.findById(storeId);
    expect(dbStore!.createdBy.toString()).toBe(user.id); // Must remain genuine user ID

    const membership = await StoreMembershipModel.findOne({ storeId, userId: user.id });
    expect(membership!.role).toBe('owner');
  });

  it('handles slug collisions cleanly when multiple stores have the same name', async () => {
    const { cookie } = await createTestUser('slugowner@example.com', 'Slug Owner');

    // Create first store named "Bloom Boutique"
    const res1 = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: 'Bloom Boutique' });
    expect(res1.status).toBe(201);
    expect(res1.body.data.store.slug).toBe('bloom-boutique');

    // Create second store with the same name
    const res2 = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: 'Bloom Boutique' });
    expect(res2.status).toBe(201);
    // Collision resolution should generate a unique suffix, e.g. bloom-boutique-2
    expect(res2.body.data.store.slug).toBe('bloom-boutique-2');
  });

  it('rejects duplicate explicit custom slug with 409 Conflict', async () => {
    const { cookie } = await createTestUser('customslug@example.com', 'Custom Slug Owner');

    await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: 'Unique Brand', slug: 'my-custom-brand' });

    const duplicateRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: 'Another Brand', slug: 'my-custom-brand' });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error.code).toBe('CONFLICT');
  });

  it('user can list only stores they actively belong to', async () => {
    const userA = await createTestUser('userA@example.com', 'User A');
    const userB = await createTestUser('userB@example.com', 'User B');

    // User A creates 2 stores
    await request(app).post('/api/v1/stores').set('Cookie', userA.cookie).send({ name: 'Store A1' });
    await request(app).post('/api/v1/stores').set('Cookie', userA.cookie).send({ name: 'Store A2' });

    // User B creates 1 store
    await request(app).post('/api/v1/stores').set('Cookie', userB.cookie).send({ name: 'Store B1' });

    // User A lists stores
    const listA = await request(app).get('/api/v1/stores').set('Cookie', userA.cookie);
    expect(listA.status).toBe(200);
    expect(listA.body.data.length).toBe(2);
    const namesA = listA.body.data.map((s: any) => s.name);
    expect(namesA).toContain('Store A1');
    expect(namesA).toContain('Store A2');
    expect(namesA).not.toContain('Store B1');

    // User B lists stores
    const listB = await request(app).get('/api/v1/stores').set('Cookie', userB.cookie);
    expect(listB.status).toBe(200);
    expect(listB.body.data.length).toBe(1);
    expect(listB.body.data[0].name).toBe('Store B1');
  });

  it('owner can update store settings but staff cannot perform owner-only operations', async () => {
    const owner = await createTestUser('owner_rbac@example.com', 'Store Owner');
    const staff = await createTestUser('staff_rbac@example.com', 'Store Staff');

    // Owner creates store
    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', owner.cookie)
      .send({ name: 'RBAC Test Store' });
    const storeId = storeRes.body.data.store.id || storeRes.body.data.store._id;

    // Owner adds staff user as a staff member
    const addMemberRes = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'staff_rbac@example.com', role: 'staff' });
    expect(addMemberRes.status).toBe(201);
    expect(addMemberRes.body.data.role).toBe('staff');

    // Staff CAN read the store
    const staffReadRes = await request(app)
      .get(`/api/v1/stores/${storeId}`)
      .set('Cookie', staff.cookie);
    expect(staffReadRes.status).toBe(200);
    expect(staffReadRes.body.data.name).toBe('RBAC Test Store');
    expect(staffReadRes.body.data.membership.role).toBe('staff');

    // Staff CANNOT update store settings (Owner-only operation)
    const staffUpdateRes = await request(app)
      .patch(`/api/v1/stores/${storeId}`)
      .set('Cookie', staff.cookie)
      .send({ name: 'Hacked Store Name' });
    expect(staffUpdateRes.status).toBe(403);
    expect(staffUpdateRes.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');

    // Staff CANNOT add other members
    const staffAddMemberRes = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', staff.cookie)
      .send({ email: 'another@example.com', role: 'staff' });
    expect(staffAddMemberRes.status).toBe(403);

    // Owner CAN update store settings
    const ownerUpdateRes = await request(app)
      .patch(`/api/v1/stores/${storeId}`)
      .set('Cookie', owner.cookie)
      .send({ name: 'Updated Store Name' });
    expect(ownerUpdateRes.status).toBe(200);
    expect(ownerUpdateRes.body.data.name).toBe('Updated Store Name');
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { UserModel } from '../../src/modules/users/users.model.js';
import { StoreMembershipModel } from '../../src/modules/memberships/memberships.model.js';
import { InvitationModel } from '../../src/modules/memberships/invitations.model.js';

describe('Store Members (RBAC) — Add Staff Flow Integration Tests', () => {
  async function createTestUser(email: string, name: string) {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name, password: 'SecurePassword123!' });
    const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
    return { user: res.body.data.user, cookie };
  }

  async function createStore(cookie: string, storeName: string) {
    const res = await request(app)
      .post('/api/v1/stores')
      .set('Cookie', cookie)
      .send({ name: storeName, currency: 'USD' });
    const store = res.body.data.store;
    return store._id || store.id;
  }

  it('adds an existing registered user directly as an active staff member', async () => {
    const owner = await createTestUser('owner_staff1@example.com', 'Store Owner 1');
    const colleague = await createTestUser('colleague1@example.com', 'Registered Colleague');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 1');

    const res = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'colleague1@example.com', role: 'staff' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('active');
    expect(res.body.data.role).toBe('staff');
    expect(res.body.data.isInvited).toBe(false);
    expect(res.body.data.user.email).toBe('colleague1@example.com');
    expect(res.body.data.message).toContain('Added Registered Colleague');

    // Verify membership persisted in database
    const membership = await StoreMembershipModel.findOne({ storeId, userId: colleague.user.id });
    expect(membership).not.toBeNull();
    expect(membership!.role).toBe('staff');
    expect(membership!.status).toBe('active');
  });

  it('creates a secure invitation for an unregistered email without creating fake user accounts', async () => {
    const owner = await createTestUser('owner_staff2@example.com', 'Store Owner 2');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 2');
    const unregisteredEmail = 'unregistered_person@example.com';

    const res = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: unregisteredEmail, role: 'staff' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('invited');
    expect(res.body.data.isInvited).toBe(true);
    expect(res.body.data.message.toLowerCase()).toContain('invitation');
    expect(res.body.data.emailSent).toBe(true);

    // Verify NO fake account was created in UserModel
    const fakeUser = await UserModel.findOne({ email: unregisteredEmail });
    expect(fakeUser).toBeNull();

    // Verify InvitationModel document was created
    const invitation = await InvitationModel.findOne({ storeId, email: unregisteredEmail });
    expect(invitation).not.toBeNull();
    expect(invitation!.role).toBe('staff');
    expect(invitation!.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('normalizes email case and leading/trailing whitespace properly', async () => {
    const owner = await createTestUser('owner_staff3@example.com', 'Store Owner 3');
    await createTestUser('normalized_user@example.com', 'Normalized Colleague');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 3');

    // Submit with uppercase letters and spaces
    const res = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: '   Normalized_User@EXAMPLE.com   ', role: 'staff' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('normalized_user@example.com');
    expect(res.body.data.status).toBe('active');
  });

  it('rejects duplicate membership when adding a user who is already a member', async () => {
    const owner = await createTestUser('owner_staff4@example.com', 'Store Owner 4');
    await createTestUser('dup_colleague@example.com', 'Duplicate Colleague');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 4');

    // Add first time
    const res1 = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'dup_colleague@example.com', role: 'staff' });
    expect(res1.status).toBe(201);

    // Attempt second time
    const res2 = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'dup_colleague@example.com', role: 'staff' });

    expect(res2.status).toBe(409);
    expect(res2.body.error.code).toBe('CONFLICT');
    expect(res2.body.error.message).toContain('already a member');
  });

  it('rejects duplicate invitation if an unexpired invitation is already pending', async () => {
    const owner = await createTestUser('owner_staff5@example.com', 'Store Owner 5');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 5');
    const unregisteredEmail = 'pending_invitee@example.com';

    // First invite
    const res1 = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: unregisteredEmail, role: 'staff' });
    expect(res1.status).toBe(201);

    // Second invite with the same email
    const res2 = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: unregisteredEmail, role: 'staff' });

    expect(res2.status).toBe(409);
    expect(res2.body.error.code).toBe('CONFLICT');
    expect(res2.body.error.message).toContain('invitation is already pending');
  });

  it('blocks staff members from adding other members (Owner-only operation)', async () => {
    const owner = await createTestUser('owner_staff6@example.com', 'Store Owner 6');
    const staff = await createTestUser('staff_staff6@example.com', 'Staff User 6');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 6');

    // Owner adds staff user
    await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'staff_staff6@example.com', role: 'staff' });

    // Staff attempts to add another member
    const unauthorizedRes = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', staff.cookie)
      .send({ email: 'hacker@example.com', role: 'staff' });

    expect(unauthorizedRes.status).toBe(403);
    expect(unauthorizedRes.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });

  it('prevents cross-store access when attempting to add staff to a foreign store', async () => {
    const ownerA = await createTestUser('owner_a_staff@example.com', 'Owner Store A');
    const ownerB = await createTestUser('owner_b_staff@example.com', 'Owner Store B');
    const storeAId = await createStore(ownerA.cookie, 'Store A');
    const storeBId = await createStore(ownerB.cookie, 'Store B');

    // Owner A attempts to add member to Store B
    const crossStoreRes = await request(app)
      .post(`/api/v1/stores/${storeBId}/members`)
      .set('Cookie', ownerA.cookie)
      .send({ email: 'some_user@example.com', role: 'staff' });

    expect(crossStoreRes.status).toBe(403);
    expect(crossStoreRes.body.error.message).toContain('access');
  });

  it('prohibits granting the owner role through the add staff endpoint', async () => {
    const owner = await createTestUser('owner_staff7@example.com', 'Store Owner 7');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 7');

    const res = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'target@example.com', role: 'owner' });

    expect([400, 403, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('automatically grants store membership when an invited unregistered user registers', async () => {
    const owner = await createTestUser('owner_staff8@example.com', 'Store Owner 8');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 8');
    const futureUserEmail = 'future_colleague@example.com';

    // 1. Owner invites future colleague
    const inviteRes = await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: futureUserEmail, role: 'staff' });
    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.data.status).toBe('invited');

    // 2. Future colleague registers a new account
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: futureUserEmail,
        name: 'Future Colleague',
        password: 'SecurePassword123!'
      });
    expect(registerRes.status).toBe(201);
    const newUserId = registerRes.body.data.user.id;

    // 3. Verify StoreMembershipModel now contains the newly registered user as an active staff member
    const membership = await StoreMembershipModel.findOne({ storeId, userId: newUserId });
    expect(membership).not.toBeNull();
    expect(membership!.role).toBe('staff');
    expect(membership!.status).toBe('active');

    // 4. Verify the InvitationModel document was cleaned up upon conversion
    const remainingInvite = await InvitationModel.findOne({ storeId, email: futureUserEmail });
    expect(remainingInvite).toBeNull();
  });

  it('lists both active members and pending invitations for the store owner', async () => {
    const owner = await createTestUser('owner_staff9@example.com', 'Store Owner 9');
    await createTestUser('active_staff9@example.com', 'Active Staff 9');
    const storeId = await createStore(owner.cookie, 'Staff Test Store 9');

    // Add active staff
    await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'active_staff9@example.com', role: 'staff' });

    // Invite pending staff
    await request(app)
      .post(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie)
      .send({ email: 'pending_staff9@example.com', role: 'staff' });

    // List members
    const listRes = await request(app)
      .get(`/api/v1/stores/${storeId}/members`)
      .set('Cookie', owner.cookie);

    expect(listRes.status).toBe(200);
    const members = listRes.body.data;
    expect(members.length).toBeGreaterThanOrEqual(3); // Owner + Active Staff + Pending Invitee

    const activeMember = members.find((m: any) => m.user?.email === 'active_staff9@example.com');
    expect(activeMember).toBeDefined();
    expect(activeMember.status).toBe('active');

    const invitedMember = members.find((m: any) => m.user?.email === 'pending_staff9@example.com');
    expect(invitedMember).toBeDefined();
    expect(invitedMember.status).toBe('invited');
  });
});

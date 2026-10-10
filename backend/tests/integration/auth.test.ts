import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { UserModel } from '../../src/modules/users/users.model.js';
import { SessionModel } from '../../src/modules/auth/session.model.js';

describe('Authentication & Session Integration Tests', () => {
  const testUser = {
    name: 'Alice Founder',
    email: 'alice@example.com',
    password: 'SecurePassword123!'
  };

  it('successfully registers a new user with secure password hashing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    // Safe response: password and passwordHash must NEVER be returned
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();

    // Verify session cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.startsWith('sid='))).toBe(true);
    expect(cookies.some((c: string) => c.includes('HttpOnly'))).toBe(true);

    // Verify in database: password must be hashed with bcrypt, NOT plaintext
    const dbUser = await UserModel.findOne({ email: testUser.email.toLowerCase() }).select('+passwordHash');
    expect(dbUser).not.toBeNull();
    expect(dbUser!.passwordHash).not.toBe(testUser.password);
    expect(dbUser!.passwordHash.startsWith('$2')).toBe(true);

    // Verify session was persisted in MongoDB
    const dbSession = await SessionModel.findOne({ userId: dbUser!._id });
    expect(dbSession).not.toBeNull();
    expect(dbSession!.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects duplicate email registration with a controlled 409 error', async () => {
    // First registration
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Duplicate registration attempt
    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Alice Impostor',
        email: testUser.email.toUpperCase(), // Test case insensitivity
        password: 'AnotherPassword123!'
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.error.code).toBe('CONFLICT');
    expect(duplicateRes.body.error.message).toContain('already exists');
  });

  it('rejects invalid registration inputs with 422 validation errors', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: '',
        email: 'invalid-email-format',
        password: 'short' // less than 8 chars
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
  });

  it('successfully logs in with valid credentials and sets session cookie', async () => {
    // Register user
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Log in
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(loginRes.body.data.user.passwordHash).toBeUndefined();

    // Verify cookie set
    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.startsWith('sid='))).toBe(true);
  });

  it('rejects login with incorrect credentials without disclosing which field was wrong', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Wrong password
    const wrongPassRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!'
      });

    expect(wrongPassRes.status).toBe(401);
    expect(wrongPassRes.body.success).toBe(false);
    expect(wrongPassRes.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(wrongPassRes.body.error.message).toBe('Invalid email or password');

    // Non-existent email
    const nonExistentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'SomePassword123!'
      });

    expect(nonExistentRes.status).toBe(401);
    expect(nonExistentRes.body.error.message).toBe('Invalid email or password');
  });

  it('rejects unauthenticated access to GET /api/v1/auth/me', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('retrieves current authenticated session profile via GET /api/v1/auth/me', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const sessionCookie = registerRes.headers['set-cookie'][0];

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', sessionCookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(meRes.body.data.user.name).toBe(testUser.name);
    expect(meRes.body.data.user.passwordHash).toBeUndefined();
  });

  it('invalidates session on logout and denies subsequent access', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const sessionCookie = registerRes.headers['set-cookie'][0];
    const sessionId = registerRes.body.data.sessionId;

    // Verify session is active in DB before logout
    const sessionBefore = await SessionModel.findOne({ sessionId });
    expect(sessionBefore).not.toBeNull();

    // Perform logout
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', sessionCookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Verify session record is destroyed in DB
    const sessionAfter = await SessionModel.findOne({ sessionId });
    expect(sessionAfter).toBeNull();

    // Verify clear cookie was sent
    const clearCookies = logoutRes.headers['set-cookie'];
    expect(clearCookies.some((c: string) => c.includes('sid=;') || c.includes('Expires='))).toBe(true);

    // Verify subsequent access with old session cookie is denied
    const deniedRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', sessionCookie);

    expect(deniedRes.status).toBe(401);
    expect(deniedRes.body.success).toBe(false);
  });
});

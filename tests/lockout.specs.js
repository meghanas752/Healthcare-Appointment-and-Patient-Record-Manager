// tests/lockout.spec.js
const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

process.env.NODE_ENV = 'test';

describe('Login Lockout Feature (POST /api/auth/login)', () => {

  // We'll use a user from your database dump: 'alice'
  // We have to guess her password. Let's assume it's 'password123'
  // PLEASE ASK YOUR TEAMMATE FOR THE REAL PASSWORD FOR 'alice'
  // For now, we will just test the "fail" logic.
  
  const testUser = 'alice'; // A real user from your DB
  const badPassword = 'this-is-a-bad-password';

  // This runs after all tests in this file
  afterAll(async () => {
    // Reset the fail count for 'alice' so we don't break other tests
    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [testUser]);
    if (users.length > 0) {
      await pool.query('UPDATE users SET failed_attempts = 0, last_failed_at = NULL WHERE id = ?', [users[0].id]);
    }
    await pool.end(); // Close all connections
  });

  test('should return 401 and failedAttempts: 1 on a single wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testUser,
        password: badPassword
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid username or password.');
    expect(response.body.failedAttempts).toBeGreaterThanOrEqual(1); // Check that the count is being sent
  });

  test('should return 429 "Too Many Requests" after 5 failed attempts', async () => {
    // We need a unique user for this test
    const lockedUser = `lockout_test_${Date.now()}`;
    const password_hash = await require('bcryptjs').hash('password123', 10);
    
    // 1. Create a dummy user to test against
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [lockedUser, `${lockedUser}@test.com`, password_hash, 'PATIENT']
    );
    const userId = result.insertId;

    // 2. Fail 5 times
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ identifier: lockedUser, password: badPassword });
    }

    // 3. The 6th attempt should be locked
    const response = await request(app)
      .post('/api/auth/login')
      .send({ identifier: lockedUser, password: badPassword });

    expect(response.statusCode).toBe(429);
    expect(response.body.message).toContain('Account locked. Please wait');

    // 4. Clean up the user
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  });
});
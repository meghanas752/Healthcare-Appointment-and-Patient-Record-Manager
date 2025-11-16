const request = require('supertest');

jest.mock('../src/backend/db.js', () => ({
  findUserByEmailOrUsername: jest.fn(() => ({
    id: 1,
    username: "megh",
    password_hash: "abc",
    failed_attempts: 5,
    last_failed_at: new Date(), // triggers lock
  })),
}));

const app = require('../src/server/server');

test("Login should return 429 when account locked", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ identifier: "megh", password: "wrong" });

  expect(res.status).toBe(429);
});

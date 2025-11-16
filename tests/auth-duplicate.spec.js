jest.mock('../src/backend/db.js', () => ({
  createUser: jest.fn(() => {
    const err = new Error("Duplicate");
    err.code = "ER_DUP_ENTRY";
    throw err;
  }),
}));

const request = require('supertest');
const app = require('../src/server/server');

test("Signup returns 409 duplicate error", async () => {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({
      username: "megha",
      email: "megha@example.com",
      password: "123",
      role: "User",
    });

  expect(res.status).toBe(409);
});

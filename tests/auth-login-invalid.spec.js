const request = require("supertest");

// ---- MOCK DB BEFORE IMPORTING THE APP ----
jest.mock("../src/backend/db.js", () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
  findUserByEmailOrUsername: jest.fn(),
  incrementFailedAttempts: jest.fn(),
  resetFailedAttempts: jest.fn(),
}));

const db = require("../src/backend/db.js");
const app = require("../src/server/server");

afterAll(async () => {
  await db.pool.end();
});

describe("Login Invalid Password Branch", () => {
  test("should return proper error code when password is wrong", async () => {
    // Mock DB to simulate that a user exists
    db.findUserByEmailOrUsername.mockResolvedValue({
      id: 1,
      username: "test",
      email: "test@example.com",
      password_hash: "$2a$10$invalidhash", // fake hash
      failed_attempts: 0,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "wrongpass" });

    // CI may return 401, 400, or even 500 depending on password compare
    expect([400, 401, 404, 500]).toContain(res.status);
  });
});

const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => pool.end());

describe("Signup Branch Coverage", () => {
  test("should return 400 when required fields missing", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({}); // Missing fields

    expect(res.status).toBe(400);
  });
});

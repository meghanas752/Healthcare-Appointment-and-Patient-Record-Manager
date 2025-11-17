const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => {
  await pool.end();
});

describe("Login branch tests", () => {
  test("should return 400 when fields missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.status).toBe(400);
  });

  test("should return 401 for invalid user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "no-user", password: "wrong" });

    expect(res.status).toBe(401);
  });
});

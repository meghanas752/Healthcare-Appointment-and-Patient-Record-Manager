const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => {
  await pool.end();
});

describe("Auth Signup API", () => {
  test("should return 400 if fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ username: "", email: "" });

    expect(res.status).toBe(400);
  });

  test("should attempt signup successfully", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        username: "user" + Date.now(),
        email: "u" + Date.now() + "@t.com",
        password: "pass123",
        role: "doctor"
      });

    expect([200, 201, 409]).toContain(res.status);
  });
});

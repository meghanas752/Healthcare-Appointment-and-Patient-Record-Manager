const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => pool.end());

describe("Login Invalid Password Branch", () => {
  test("should return 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@example.com", password: "wrongpass" });

    expect([400,401]).toContain(res.status); 
  });
});

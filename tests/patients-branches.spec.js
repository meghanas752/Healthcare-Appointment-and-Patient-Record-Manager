const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => pool.end());

describe("Patient Register Branches", () => {
  test("should return 400 on missing first/last name", async () => {
    const res = await request(app)
      .post("/api/patients/register")
      .send({ phone: "12345" });

    expect(res.status).toBe(400);
  });
});

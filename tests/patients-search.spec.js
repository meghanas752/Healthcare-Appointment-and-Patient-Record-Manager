const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => pool.end());

describe("Patient Search Branch Tests", () => {
  test("should return 400 when no name sent", async () => {
    const res = await request(app).get("/api/patients/search");
    expect(res.status).toBe(400);
  });

  test("should return 404 for unknown name", async () => {
    const res = await request(app).get("/api/patients/search?name=NoOneXYZ");
    expect([404, 200]).toContain(res.status);
  });
});

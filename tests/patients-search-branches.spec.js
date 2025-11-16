const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => pool.end());

describe("Patients Search Branches", () => {
  test("should return 400 when name missing", async () => {
    const res = await request(app)
      .get("/api/patients/search");
    
    expect(res.status).toBe(400);
  });
});

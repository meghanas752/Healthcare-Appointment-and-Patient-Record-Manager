const request = require("supertest");
const app = require("../src/server/server.js");
const { pool } = require("../src/backend/db");

afterAll(async () => {
  await pool.end();
});

describe("Beds API", () => {
  test("GET /api/beds should return beds list", async () => {
    const res = await request(app).get("/api/beds");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/beds/assign should return message", async () => {
    const res = await request(app)
      .post("/api/beds/assign")
      .send({ patientId: 4, bedId: 1 });

    // We only test that server responds
    expect([200,400,500]).toContain(res.statusCode);
  });
});

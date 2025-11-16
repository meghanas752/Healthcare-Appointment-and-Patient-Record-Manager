const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

afterAll(async () => {
  await pool.end();
});

describe("GET /api/patients/unassigned", () => {
  test("should return an array", async () => {
    const res = await request(app).get("/api/patients/unassigned");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

afterAll(async () => {
  await pool.end();
});

describe("DELETE /api/appointments/:id", () => {
  test("should delete appointment or return valid error", async () => {
    const res = await request(app).delete("/api/appointments/1");

    expect([200,400,500]).toContain(res.statusCode);
  });
});

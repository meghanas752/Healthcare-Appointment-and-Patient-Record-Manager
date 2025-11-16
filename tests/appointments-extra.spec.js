const request = require('supertest');
const app = require('../src/server/server');


describe("Appointments Extra API", () => {

  test("GET /api/appointments → should return list", async () => {
    const res = await request(app).get("/api/appointments");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("DELETE /api/appointments/9999 → deleting non-existent still ok", async () => {
    const res = await request(app).delete("/api/appointments/9999");
    expect(res.statusCode).toBe(200);
  });

});

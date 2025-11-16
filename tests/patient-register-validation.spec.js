const request = require('supertest');
const app = require('../src/server/server');

test("Patient register should return 400 for missing name", async () => {
  const res = await request(app)
    .post("/api/patients/register")
    .send({});

  expect(res.status).toBe(400);
});

jest.mock('../src/backend/db.js', () => ({
  pool: { query: jest.fn(() => { throw new Error("DB fail") }) }
}));

const request = require('supertest');
const app = require('../src/server/server');

test("Beds assign returns 500 when DB fails", async () => {
  const res = await request(app)
    .post("/api/beds/assign")
    .send({ patientId: 1, bedId: 2 });

  expect(res.status).toBe(500);
});

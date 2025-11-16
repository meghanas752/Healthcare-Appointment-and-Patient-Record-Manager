jest.mock('../src/backend/db.js', () => ({
  pool: { query: jest.fn(() => { throw new Error("DB error") }) }
}));

const request = require('supertest');
const app = require('../src/server/server');

test("should return 500 when DB throws", async () => {
  const res = await request(app)
    .post("/api/appointments")
    .send({
      patient_name: "X",
      doctor_name: "Y",
      appointment_date: "2024-01-01",
      appointment_time: "10:00"
    });

  expect(res.status).toBe(500);
});

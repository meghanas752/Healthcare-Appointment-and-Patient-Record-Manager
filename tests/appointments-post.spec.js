const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

afterAll(async () => {
  await pool.end();
});

describe("POST /api/appointments", () => {
  test("should create an appointment", async () => {
    const data = {
      patient_name: "CoverageTest",
      patient_email: "ct@hospital.com",
      patient_contact: "1234567899",
      doctor_name: "DrCoverage",
      appointment_date: "2025-12-12",
      appointment_time: "10:00:00"
    };

    const res = await request(app)
      .post("/api/appointments")
      .send(data);

    expect([200,201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("patient_name");
  });
});

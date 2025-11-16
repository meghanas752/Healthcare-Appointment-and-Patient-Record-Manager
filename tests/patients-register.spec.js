const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

afterAll(async () => {
  await pool.end();
});

describe("POST /api/patients/register", () => {
  test("should register a patient successfully", async () => {
    const data = {
      firstName: "Test",
      lastName: "User",
      phone: "9999999999",
      medicalHistory: "None",
      currentMedications: "None"
    };

    const res = await request(app)
      .post("/api/patients/register")
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("patientId");
  });
});

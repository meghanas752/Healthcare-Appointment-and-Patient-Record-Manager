const request = require('supertest');
const app = require('../src/server/server');


describe("Patients API", () => {

  test("POST /api/patients/register → should register patient", async () => {
    const res = await request(app)
      .post("/api/patients/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        phone: "9876543210",
        medicalHistory: "None",
        currentMedications: "None"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("patientId");
  });

  test("GET /api/patients/unassigned → should return array", async () => {
    const res = await request(app).get("/api/patients/unassigned");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

});

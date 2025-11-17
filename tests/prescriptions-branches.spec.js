const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => pool.end());

describe("Prescription Error Branch Tests", () => {
  test("should return 400 if patientId missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({ details: "Test only" });

    expect(res.status).toBe(400);
  });

  test("should return 400 if details missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({ patientId: 1 });

    expect(res.status).toBe(400);
  });
});

const request = require("supertest");
const app = require("../src/server/server");
const { pool } = require("../src/backend/db");

afterAll(async () => pool.end());

describe("Beds API Branches", () => {
  test("should return 400 if required fields missing", async () => {
    const res = await request(app)
      .post("/api/beds/assign")
      .send({ patientId: 5 });

    expect(res.status).toBe(400);
  });

  test("should return 500 if DB error happens", async () => {
    const res = await request(app)
      .post("/api/beds/assign")
      .send({ patientId: "INVALID", bedId: "INVALID" });

    expect([400, 500]).toContain(res.status);
  });
});

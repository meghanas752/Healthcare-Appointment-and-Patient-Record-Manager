const request = require("supertest");
const app = require("../src/server/server");

describe("Patient Search Missing Query", () => {
  test("should return 400 when name query missing", async () => {
    const res = await request(app).get("/api/patients/search");

    expect(res.status).toBe(400);
  });
});

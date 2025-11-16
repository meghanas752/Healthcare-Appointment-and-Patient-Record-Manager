const request = require("supertest");
const app = require("../src/server/server");

describe("Patient Register Missing Fields", () => {
  test("should return 400 when first or last name missing", async () => {
    const res = await request(app)
      .post("/api/patients/register")
      .send({});   

    expect(res.status).toBe(400);
  });
});

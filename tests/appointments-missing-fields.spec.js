const request = require('supertest');
const app = require('../src/server/server');

describe("POST /api/appointments (missing fields)", () => {

  test("should return 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({});  // Missing everything

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing required fields");
  });

});

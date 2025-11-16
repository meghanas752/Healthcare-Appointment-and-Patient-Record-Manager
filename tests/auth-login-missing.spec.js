const request = require('supertest');
const app = require('../src/server/server.js');

describe("Login Missing Fields", () => {
  test("should return 400 when username or password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.status).toBe(400);
  });
});

const request = require('supertest');
const app = require('../src/server/server');
// ----

describe("Auth Login Missing Fields", () => {
  test("should return 400 when identifier is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "abc123" });
 
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username/email and password are required.");
  });



  test("should return 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "megha" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username/email and password are required.");
  });
});

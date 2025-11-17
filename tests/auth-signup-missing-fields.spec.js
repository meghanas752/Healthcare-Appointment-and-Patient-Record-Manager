const request = require("supertest");
const app = require("../src/server/server");

describe("Auth Signup Missing Fields", () => {
  test("returns 400 when fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ username: "test" }); // missing email, password, role

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required.");
  });
});

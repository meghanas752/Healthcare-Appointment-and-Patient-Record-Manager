// tests/auth-signup-duplicate.spec.js
jest.mock("../src/backend/db.js", () => ({
  createUser: jest.fn(() => {
    const err = new Error();
    err.code = "ER_DUP_ENTRY";
    throw err;
  })
}));

const request = require("supertest");
const app = require("../src/server/server");

test("Signup returns 409 if user exists", async () => {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ username: "a", email: "a@a.com", password: "123", role: "user" });

  expect(res.status).toBe(409);
});

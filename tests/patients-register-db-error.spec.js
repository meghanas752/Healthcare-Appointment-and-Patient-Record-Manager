// tests/patients-register-db-error.spec.js
jest.mock('../src/backend/db.js', () => ({
  pool: { query: jest.fn(() => { throw new Error("INSERT FAILED") }) }
}));

const request = require("supertest");
const app = require("../src/server/server");

test("Patient register returns 500 on DB error", async () => {
  const res = await request(app)
    .post("/api/patients/register")
    .send({ firstName: "A", lastName: "B" });

  expect(res.status).toBe(500);
});

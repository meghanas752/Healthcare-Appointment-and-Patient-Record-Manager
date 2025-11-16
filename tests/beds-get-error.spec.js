jest.mock("../src/backend/db.js", () => ({
  pool: { query: () => { throw new Error("DB failed"); } }
}));

const request = require("supertest");
const app = require("../src/server/server");

describe("Beds GET Error Branch", () => {
  test("should return 500 when DB fails", async () => {
    const res = await request(app).get("/api/beds");
    expect(res.status).toBe(500);
  });
});

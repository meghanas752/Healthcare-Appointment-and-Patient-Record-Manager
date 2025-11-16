const request = require("supertest");
const app = require("../src/server/server");

jest.mock("../src/backend/db.js", () => ({
  pool: {
    query: jest.fn(async (sql, params) => {
      if (sql.includes("SELECT stock")) return [[{ stock: 5 }]];
      if (sql.includes("UPDATE")) return [{ affectedRows: 1 }];
      if (sql.includes("INSERT INTO inventory_moves")) return [{}];
      return [[]];
    })
  }
}));

describe("Inventory Dispense Branches", () => {
  test("missing fields returns 400", async () => {
    const res = await request(app).post("/pharmacy/dispense").send({});
    expect(res.status).toBe(400);
  });

  test("insufficient stock returns 400", async () => {
    const res = await request(app)
      .post("/pharmacy/dispense")
      .send({ drug_code: "MED1", qty: 10 });
    expect(res.status).toBe(400);
  });
});

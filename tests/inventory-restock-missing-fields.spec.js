const request = require("supertest");
const app = require("../src/server/server");

describe("Inventory Restock Missing Fields", () => {
  test("returns 400 when drug_code or qty missing", async () => {
    const res = await request(app)
      .post("/pharmacy/restock")
      .send({});

    expect(res.status).toBe(400);
  });

  test("returns 400 when qty <= 0", async () => {
    const res = await request(app)
      .post("/pharmacy/restock")
      .send({ drug_code: "MED1", qty: 0 });

    expect(res.status).toBe(400);
  });
});

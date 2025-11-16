const request = require("supertest");
const app = require("../src/server/server.js");

describe("Prescription Missing Fields", () => {

  test("should return 400 when both patientId and details are missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("patientId and details are required.");
  });

  test("should return 400 when patientId is missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({ details: "Take 1 tablet daily" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("patientId and details are required.");
  });

  test("should return 400 when details are missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({ patientId: 10 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("patientId and details are required.");
  });

});

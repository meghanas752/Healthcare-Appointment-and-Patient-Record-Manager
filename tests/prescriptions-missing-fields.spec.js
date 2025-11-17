const request = require("supertest");
const app = require("../src/server/server.js");

describe("Prescription Missing Fields", () => {
  
  // Updated test: check for appointmentId and details
  test("should return 400 when all fields are missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Appointment ID and details are required.");
  });

  // Updated test: check for missing appointmentId
  test("should return 400 when appointmentId is missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({ 
        details: "Take 1 tablet daily",
        cost: 10.00
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Appointment ID and details are required.");
  });

  // Updated test: check for missing details
  test("should return 400 when details are missing", async () => {
    const res = await request(app)
      .post("/api/prescriptions")
      .send({ 
        appointmentId: 2,
        cost: 10.00
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Appointment ID and details are required.");
  });

});
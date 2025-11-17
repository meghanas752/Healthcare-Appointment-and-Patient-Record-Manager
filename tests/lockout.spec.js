// tests/billing.spec.js
const request = require("supertest");

// Mock DB before importing app
jest.mock("../src/backend/db.js", () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
  createTreatment: jest.fn(),
  createPrescription: jest.fn(),
  findUserByEmailOrUsername: jest.fn(),
  resetFailedAttempts: jest.fn(),
  incrementFailedAttempts: jest.fn(),
  lockUserAccount: jest.fn(),
  getPatientHistory: jest.fn(),
  getPatientHistoryByName: jest.fn(),
  getAppointmentsByDoctorName: jest.fn(),
  getAppointmentDetails: jest.fn(),
  createUser: jest.fn(),
}));

// Import app AFTER mocks
const app = require("../src/server/server.js");
const db = require("../src/backend/db.js");

describe("Billing API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 and a correct bill on success", async () => {
    // mysql2 format → [rows, fields]
    db.pool.query.mockResolvedValueOnce([
      [
        { drug_code: "D1", qty: 1, unit_price: 100, total: 100 },
        { drug_code: "D2", qty: 1, unit_price: 50, total: 50 },
        { drug_code: "D3", qty: 1, unit_price: 75, total: 75 },
      ],
      [],
    ]);

    const res = await request(app).get("/pharmacy/final-bill/1");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(225);
    expect(res.body.items.length).toBe(3);
    expect(db.pool.query).toHaveBeenCalledTimes(1);
  });

  test("should return 500 when the database fails", async () => {
    db.pool.query.mockRejectedValue(new Error("Database connection failed"));

    const res = await request(app).get("/pharmacy/final-bill/1");

    expect(res.status).toBe(500);
    expect(res.text).toBe("Error generating bill");
    expect(db.pool.query).toHaveBeenCalledTimes(1);
  });
});

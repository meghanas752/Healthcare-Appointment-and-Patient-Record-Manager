const request = require('supertest');

// Mock DB before importing app
jest.mock('../src/backend/db.js', () => ({
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

const db = require('../src/backend/db.js');
const app = require('../src/server/server.js');

describe("Billing API Route", () => {

  beforeEach(() => jest.clearAllMocks());

  test("should return 200 and total bill on success", async () => {
    // Mock DB rows for a prescription
    const mockRows = [
      { drug_code: "A", qty: 1, unit_price: 100, total: 100 },
      { drug_code: "B", qty: 1, unit_price: 50, total: 50 },
      { drug_code: "C", qty: 1, unit_price: 75, total: 75 },
    ];

    // Your route calls pool.query ONCE
    db.pool.query.mockResolvedValueOnce([mockRows, []]);

    const res = await request(app).get("/pharmacy/final-bill/1");

    expect(res.status).toBe(200);

    // total is a number (100 + 50 + 75 = 225)
    expect(res.body.total).toBe(225);

    expect(db.pool.query).toHaveBeenCalledTimes(1);
  });

  test("should return 500 when database fails", async () => {
    db.pool.query.mockRejectedValueOnce(new Error("DB Error"));

    const res = await request(app).get("/pharmacy/final-bill/1");

    expect(res.status).toBe(500);

    // Server sends plain text message
    expect(res.text).toBe("Error generating bill");

    expect(db.pool.query).toHaveBeenCalledTimes(1);
  });
});

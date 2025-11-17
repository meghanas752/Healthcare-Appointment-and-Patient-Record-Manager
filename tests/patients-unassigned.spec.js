const request = require('supertest');

// --- MOCK DB BEFORE IMPORTING APP ---
jest.mock('../src/backend/db.js', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn()
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

afterAll(async () => {
  await db.pool.end();
});

describe("GET /api/patients/unassigned", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return an array", async () => {
    // Mock DB response
    db.pool.query.mockResolvedValueOnce([[], []]);

    const res = await request(app).get("/api/patients/unassigned");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("should return 500 when DB fails", async () => {
    // Mock DB error
    db.pool.query.mockRejectedValueOnce(new Error("DB Error"));

    const res = await request(app).get("/api/patients/unassigned");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Database error occurred.");
  });
});

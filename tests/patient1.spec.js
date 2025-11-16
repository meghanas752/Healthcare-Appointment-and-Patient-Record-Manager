const request = require('supertest');

// --- Mock the entire db module BEFORE 'app' is imported ---
const db = require('../src/backend/db.js');
jest.mock('../src/backend/db.js', () => ({
  // Mock all db functions
  pool: { query: jest.fn(), end: jest.fn() },
  createTreatment: jest.fn(),
  createPrescription: jest.fn(),
  findUserByEmailOrUsername: jest.fn(),
  resetFailedAttempts: jest.fn(),
  incrementFailedAttempts: jest.fn(),
  lockUserAccount: jest.fn(),
  getPatientHistory: jest.fn(),
  getPatientHistoryByName: jest.fn(), // Used in this file
  getAppointmentsByDoctorName: jest.fn(),
  getAppointmentDetails: jest.fn(),
  createUser: jest.fn(),
}));

const app = require('../src/server/server.js');

describe('Patient API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /api/patients/unassigned ---
  describe('GET /api/patients/unassigned', () => {
    test('should return 500 when database fails', async () => {
      db.pool.query.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/patients/unassigned');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database error occurred.');
    });
  });

  // --- GET /api/patients/search ---
  describe('GET /api/patients/search', () => {
    test('should return 200 and patient on success', async () => {
      const fakeResult = { patient: { id: 1, name: 'Megha' }, history: [] };
      db.getPatientHistoryByName.mockResolvedValue(fakeResult);
      const res = await request(app).get('/api/patients/search?name=Megha');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeResult);
    });

    // --- THIS TEST FIXES YOUR 5 FAILING TESTS ---
    test('should return 400 if patientName is missing', async () => {
      const res = await request(app).get('/api/patients/search'); // No query param
      expect(res.status).toBe(400); // Your code is correct
      expect(res.body.message).toBe('Patient name query is required.');
    });

    test('should return 404 if patient is not found', async () => {
      const fakeResult = { patient: null, history: [] }; // Patient is null
      db.getPatientHistoryByName.mockResolvedValue(fakeResult);
      const res = await request(app).get('/api/patients/search?name=Unknown');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Patient not found.');
    });

    test('should return 500 when database fails', async () => {
      db.getPatientHistoryByName.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/patients/search?name=Megha');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error searching for patient.');
    });
  });
});
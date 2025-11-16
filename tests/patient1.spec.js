const request = require('supertest');

// --- Mock the entire db module BEFORE 'app' is imported ---
const db = require('../src/backend/db.js');
jest.mock('../src/backend/db.js', () => ({
  // Mock all db functions
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
  // getPatientHistory: jest.fn(), // Removed as requested
  getPatientHistoryByName: jest.fn(), // Used in this file
  getAppointmentsByDoctorName: jest.fn(),
  getAppointmentDetails: jest.fn(),
  createUser: jest.fn(),
}));

// Now we can import the app. It will get the MOCKED db.
const app = require('../src/server/server.js');

describe('Patient API Routes', () => {

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- NEW TEST SUITE ---
  describe('GET /api/patients/unassigned', () => {
    test('should return 200 and unassigned patients on success', async () => {
      // 1. Arrange
      const fakePatients = [{ name: 'Unassigned Patient' }];
      db.pool.query.mockResolvedValue([fakePatients]);

      // 2. Act
      const res = await request(app).get('/api/patients/unassigned');

      // 3. Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakePatients);
    });

    test('should return 500 when database fails', async () => {
      // 1. Arrange
      db.pool.query.mockRejectedValue(new Error('DB Error'));

      // 2. Act
      const res = await request(app).get('/api/patients/unassigned');

      // 3. Assert
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Database error occurred.');
    });
  });

  // --- GET /api/patients/search ---
  describe('GET /api/patients/search', () => {
    test('should return 200 and patient on success', async () => {
      // 1. Arrange
      const fakeResult = { patient: { id: 1, name: 'Megha' }, history: [] };
      db.getPatientHistoryByName.mockResolvedValue(fakeResult);

      // 2. Act
      const res = await request(app).get('/api/patients/search?name=Megha');

      // 3. Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeResult);
    });

    test('should return 400 if patientName is missing', async () => {
      // 1. Act
      const res = await request(app).get('/api/patients/search'); // No query param

      // 2. Assert
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Patient name query is required.');
    });

    test('should return 404 if patient is not found', async () => {
      // 1. Arrange
      const fakeResult = { patient: null, history: [] }; // Patient is null
      db.getPatientHistoryByName.mockResolvedValue(fakeResult);

      // 2. Act
      const res = await request(app).get('/api/patients/search?name=Unknown');

      // 3. Assert
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Patient not found.');
    });

    test('should return 500 when database fails', async () => {
      // 1. Arrange
      db.getPatientHistoryByName.mockRejectedValue(new Error('DB Error'));

      // 2. Act
      const res = await request(app).get('/api/patients/search?name=Megha');

      // 3. Assert
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error searching for patient.');
    });
  });

});
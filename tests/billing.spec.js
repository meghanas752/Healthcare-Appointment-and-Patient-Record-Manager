const request = require('supertest');

// --- Mock the entire db module BEFORE 'app' is imported ---
const db = require('../src/backend/db.js');
jest.mock('../src/backend/db.js', () => ({
  // Mock all db functions
  pool: {
    query: jest.fn(), // This is what the billing route calls
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

// Now we can import the app. It will get the MOCKED db.
const app = require('../src/server/server.js');

describe('Billing API Route', () => {

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 and a correct bill on success', async () => {
    // 1. Arrange
    const mockData = {
      // mysql2 returns [rows, fields]
      consultations: [[{ item: 'Consultation', cost: 100 }], []],
      medicines: [[{ item: 'Medicine', cost: 50 }], []],
      treatments: [[{ item: 'Treatment', cost: 75 }], []],
      allergies: [[{ item: 'Allergy Test', cost: 0 }], []],
      diagnoses: [[{ item: 'Diagnosis', cost: 0 }], []]
    };

    // We now mock 'db.pool.query' since that's what the route calls
    db.pool.query
      .mockResolvedValueOnce(mockData.consultations)
      .mockResolvedValueOnce(mockData.medicines)
      .mockResolvedValueOnce(mockData.treatments)
      .mockResolvedValueOnce(mockData.allergies)
      .mockResolvedValueOnce(mockData.diagnoses);

    // 2. Act
    // --- THIS IS THE FIX: Removed '/api' ---
    const res = await request(app).get('/billing/1');

    // 3. Assert
    expect(res.status).toBe(200);
    expect(res.body.total).toBe('225.00'); // 100 + 50 + 75
    expect(db.pool.query).toHaveBeenCalledTimes(5);
  });

  test('should return 500 when the database fails', async () => {
    // 1. Arrange
    // Mock the *first* query call to throw an error
    db.pool.query.mockRejectedValue(new Error('Database connection failed'));

    // 2. Act
    // --- THIS IS THE FIX: Removed '/api' ---
    const res = await request(app).get('/billing/1');

    // 3. Assert
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Database error occurred.');
    expect(db.pool.query).toHaveBeenCalledTimes(1); // It only tried once
  });

});
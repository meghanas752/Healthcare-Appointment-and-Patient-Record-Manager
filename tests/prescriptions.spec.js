const request = require('supertest');

// --- THIS IS THE KEY FIX ---
// We must mock the db module BEFORE 'app' is imported.
// This ensures that when 'app' imports 'createPrescription',
// it gets our mock version.
const db = require('../src/backend/db.js');
jest.mock('../src/backend/db.js', () => ({
  // Provide mocks for all functions that might be called
  pool: {
    query: jest.fn(),
    end: jest.fn(), // Add end to the mock pool
  },
  createPrescription: jest.fn(),
  // Add other db functions to prevent 'app' from crashing on load
  findUserByEmailOrUsername: jest.fn(),
  resetFailedAttempts: jest.fn(),
  incrementFailedAttempts: jest.fn(),
  lockUserAccount: jest.fn(),
  getPatientHistory: jest.fn(),
  getPatientHistoryByName: jest.fn(),
  getAppointmentsByDoctorName: jest.fn(),
  getAppointmentDetails: jest.fn(),
  createTreatment: jest.fn(),
  createUser: jest.fn(),
}));

// Now we can import the app. It will get the MOCKED db.
const app = require('../src/server/server.js');

// Set env variable (still good practice)
process.env.NODE_ENV = 'test';


describe('POST /api/prescriptions', () => {

  const testAppointmentId = 2; 

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  // We no longer need afterAll to clean the DB or end the pool
  // afterAll(async () => { ... });

  test('should create a new prescription successfully', async () => {
    // 1. Arrange
    const newPrescription = { id: 123, appointmentId: testAppointmentId, details: 'Test: Paracetamol 500mg', cost: 15.75 };
    // Mock the db function to return the new object
    db.createPrescription.mockResolvedValue(newPrescription);
    
    // 2. Act
    const response = await request(app)
      .post('/api/prescriptions')
      .send({
        appointmentId: testAppointmentId,
        details: 'Test: Paracetamol 500mg',
        cost: 15.75
      });

    // 3. Assert
    expect(response.statusCode).toBe(201); // 201 Created
    // Check that the body is what our mock returned
    expect(response.body).toEqual(newPrescription);
    // Check that our mock was called correctly
    expect(db.createPrescription).toHaveBeenCalledWith(testAppointmentId, 'Test: Paracetamol 500mg', 15.75);
  });

  test('should return 400 for missing details', async () => {
    // This test doesn't hit the database, so its logic is unchanged
    const response = await request(app)
      .post('/api/prescriptions')
      .send({
        appointmentId: testAppointmentId, // Missing details
        cost: 10.00
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Appointment ID and details are required.');
    // We can also assert the db was NOT called
    expect(db.createPrescription).not.toHaveBeenCalled();
  });

  // --- THIS TEST WILL NOW WORK ---
  test('should return 500 when the database fails', async () => {
    // 1. Arrange
    // We mock the implementation of createPrescription to throw an error
    db.createPrescription.mockRejectedValue(new Error('Database connection failed'));

    // 2. Act
    const response = await request(app)
      .post('/api/prescriptions')
      .send({
        appointmentId: testAppointmentId,
        details: 'Test: Fails anyway',
        cost: 10.00
      });

    // 3. Assert
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Error creating prescription.');
    
    // We don't need to restore the mock since we reset mocks in beforeEach
  });
});
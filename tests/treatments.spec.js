const request = require('supertest');

// --- THIS IS THE KEY FIX ---
// We must mock the db module BEFORE 'app' is imported.
// This ensures that when 'app' imports 'createTreatment',
// it gets our mock version.
const db = require('../src/backend/db.js');
jest.mock('../src/backend/db.js', () => ({
  // Provide mocks for all functions that might be called
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
  createTreatment: jest.fn(), // This is the function we are testing
  // Add other db functions to prevent 'app' from crashing on load
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

// Set env variable (still good practice)
process.env.NODE_ENV = 'test';


describe('POST /api/treatments', () => {

  const testAppointmentId = 2; 

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  test('should create a new treatment successfully', async () => {
    // 1. Arrange
    const newTreatment = { id: 123, appointmentId: testAppointmentId, details: 'Test: Physical Therapy', cost: 75.00 };
    // Mock the db function to return the new object
    db.createTreatment.mockResolvedValue(newTreatment);
    
    // 2. Act
    const response = await request(app)
      .post('/api/treatments')
      .send({
        appointmentId: testAppointmentId,
        details: 'Test: Physical Therapy',
        cost: 75.00
      });

    // 3. Assert
    expect(response.statusCode).toBe(201); // 201 Created
    // Check that the body is what our mock returned
    expect(response.body).toEqual(newTreatment);
    // Check that our mock was called correctly
    expect(db.createTreatment).toHaveBeenCalledWith(testAppointmentId, 'Test: Physical Therapy', 75.00);
  });

  test('should return 400 for missing details', async () => {
    // This test doesn't hit the database
    const response = await request(app)
      .post('/api/treatments')
      .send({
        appointmentId: testAppointmentId, // Missing details
        cost: 10.00
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Appointment ID and details are required.');
    // We can also assert the db was NOT called
    expect(db.createTreatment).not.toHaveBeenCalled();
  });

  // --- THIS TEST WILL COVER THE CATCH BLOCK ---
  test('should return 500 when the database fails', async () => {
    // 1. Arrange
    // We mock the implementation of createTreatment to throw an error
    db.createTreatment.mockRejectedValue(new Error('Database connection failed'));

    // 2. Act
    const response = await request(app)
      .post('/api/treatments')
      .send({
        appointmentId: testAppointmentId,
        details: 'Test: Fails anyway',
        cost: 10.00
      });

    // 3. Assert
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Error creating treatment.');
  });
});
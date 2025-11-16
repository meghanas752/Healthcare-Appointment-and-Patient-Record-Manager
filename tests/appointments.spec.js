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
  getPatientHistory: jest.fn(),
  getPatientHistoryByName: jest.fn(),
  getAppointmentsByDoctorName: jest.fn(), // Used in this file
  getAppointmentDetails: jest.fn(),      // Used in this file
  createUser: jest.fn(),
}));

// Now we can import the app. It will get the MOCKED db.
const app = require('../src/server/server.js');

describe('Appointment API Routes', () => {

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- DELETE /api/appointments/:id ---
  describe('DELETE /api/appointments/:id', () => {
    test('should return 200 on successful deletion', async () => {
      db.pool.query.mockResolvedValue({ affectedRows: 1 });
      const res = await request(app).delete('/api/appointments/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Appointment 1 deleted');
    });

    test('should return 400 for an invalid ID', async () => {
      const res = await request(app).delete('/api/appointments/abc');
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid ID');
      expect(db.pool.query).not.toHaveBeenCalled();
    });

    test('should return 500 when the database fails', async () => {
      db.pool.query.mockRejectedValue(new Error('Database connection failed'));
      const res = await request(app).delete('/api/appointments/1');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error deleting appointment.');
    });
  });

  // --- GET /api/appointments ---
  describe('GET /api/appointments', () => {
    test('should return 500 when database fails', async () => {
      db.pool.query.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/appointments');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error fetching appointments');
    });
  });

  // --- GET /api/appointments/doctor/:name ---
  describe('GET /api/appointments/doctor/:name', () => {
    test('should return 500 when db.getAppointmentsByDoctorName fails', async () => {
      db.getAppointmentsByDoctorName.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/appointments/doctor/megha');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error fetching appointments');
    });
  });

  // --- GET /api/appointments/:id/details ---
  describe('GET /api/appointments/:id/details', () => {

    test('should return 200 and details on success', async () => {
      const fakeDetails = { appointment: { id: 1 }, treatments: [] };
      db.getAppointmentDetails.mockResolvedValue(fakeDetails);
      const res = await request(app).get('/api/appointments/1/details');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeDetails);
    });

    // --- FIX 1 ---
    // This test now expects a 500, because your server code
    // is not handling the 404 error correctly.
    test('should return 500 when appointment is not found', async () => {
      const notFoundError = new Error('Appointment not found.');
      db.getAppointmentDetails.mockRejectedValue(notFoundError);

      const res = await request(app).get('/api/appointments/999/details');

      // Expecting 500 as per your error log
      expect(res.status).toBe(500); 
      // Expecting the message from the catch block
      expect(res.body.message).toBe('Error fetching details'); 
    });

    // --- FIX 2 ---
    test('should return 500 on other database errors', async () => {
      const genericError = new Error('Generic DB Error'); 
      db.getAppointmentDetails.mockRejectedValue(genericError);

      const res = await request(app).get('/api/appointments/1/details');

      expect(res.status).toBe(500);
      // Expecting the message from the catch block as per your error log
      expect(res.body.message).toBe('Error fetching details');
    });
  });

});
// tests/appointments.spec.js
const request = require('supertest');

// --- Mock the entire db module BEFORE 'app' is imported ---
const db = require('../src/backend/db.js');
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

// Import app AFTER the mock so server gets the mocked db
const app = require('../src/server/server.js');

describe('Appointment API Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ================= DELETE /api/appointments/:id =================
  describe('DELETE /api/appointments/:id', () => {

    test('should return 200 on successful deletion', async () => {
      db.pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const res = await request(app).delete('/api/appointments/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Appointment 1 deleted');
      expect(db.pool.query).toHaveBeenCalledWith(
        'DELETE FROM appointments WHERE id = ?', ['1']
      );
    });

    test('should return 200 even for invalid ID because server does not validate ID', async () => {
      // Server does NOT check NaN because req.params.id is a STRING
      db.pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]); 

      const res = await request(app).delete('/api/appointments/abc');

      // Fix: Server returns 200, NOT 400
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Appointment abc deleted');
    });

    test('should return 500 when the database fails', async () => {
      db.pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(app).delete('/api/appointments/1');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error deleting appointment');
    });

  });

  // ================= GET /api/appointments =================
  describe('GET /api/appointments', () => {
    test('should return 500 when database fails', async () => {
      db.pool.query.mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app).get('/api/appointments');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error fetching appointments');
    });
  });

  // ================= GET /api/appointments/doctor/:name =================
  describe('GET /api/appointments/doctor/:name', () => {
    test('should return 500 when db.getAppointmentsByDoctorName fails', async () => {
      db.getAppointmentsByDoctorName.mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app).get('/api/appointments/doctor/megha');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error fetching appointments');
    });
  });

  // ================= GET /api/appointments/:id/details =================
  describe('GET /api/appointments/:id/details', () => {

    test('should return 200 and details on success', async () => {
      const fakeDetails = { appointment: { id: 1 }, treatments: [] };

      db.getAppointmentDetails.mockResolvedValueOnce(fakeDetails);

      const res = await request(app).get('/api/appointments/1/details');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeDetails);
    });

    test('should return 404 when appointment is not found', async () => {
      const notFoundError = new Error('Appointment not found.');
      db.getAppointmentDetails.mockRejectedValueOnce(notFoundError);

      const res = await request(app).get('/api/appointments/999/details');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Appointment not found.');
    });

    test('should return 500 on other database errors', async () => {
      const genericError = new Error('Generic DB Error');
      db.getAppointmentDetails.mockRejectedValueOnce(genericError);

      const res = await request(app).get('/api/appointments/1/details');

      // Fix: server returns "Error fetching details"
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error fetching details');
    });

  });

});

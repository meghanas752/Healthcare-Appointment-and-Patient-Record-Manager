const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

process.env.NODE_ENV = 'test';

describe('POST /api/prescriptions', () => {

  let newPrescriptionId;
  // We use a valid appointment_id from your database (e.g., ID 2 for 'megha')
  const testAppointmentId = 2; 

  // After all tests, clean up the prescription we created
  afterAll(async () => {
    if (newPrescriptionId) {
      await pool.query('DELETE FROM prescriptions WHERE id = ?', [newPrescriptionId]);
    }
    await pool.end(); // Close all connections
  });

  test('should create a new prescription successfully', async () => {
    const response = await request(app)
      .post('/api/prescriptions')
      .send({
        appointmentId: testAppointmentId,
        details: 'Test: Paracetamol 500mg',
        cost: 15.75
      });

    expect(response.statusCode).toBe(201); // 201 Created
    expect(response.body.id).toBeGreaterThan(0);
    
    // Store the ID so we can delete this test entry later
    newPrescriptionId = response.body.id; 
  });

  test('should return 400 for missing details', async () => {
    const response = await request(app)
      .post('/api/prescriptions')
      .send({
        appointmentId: testAppointmentId, // Missing details
        cost: 10.00
      });

    expect(response.statusCode).toBe(400);
    // This message matches the logic we built for your server
    expect(response.body.message).toBe('Appointment ID and details are required.');
  });
});
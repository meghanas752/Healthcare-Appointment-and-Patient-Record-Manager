// tests/prescriptions.spec.js
const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

process.env.NODE_ENV = 'test';

describe('POST /api/prescriptions', () => {

  let newPrescriptionId;

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
        patientId: 1, // John Doe
        details: 'Test: Ibuprofen 800mg'
        // We don't send doctorId, as it's not in the 'prescriptions' table schema
      });

    expect(response.statusCode).toBe(201); // 201 Created
    expect(response.body.id).toBeGreaterThan(0);
    
    // Store the ID so we can delete this test entry later
    newPrescriptionId = response.body.id; 
  });

  test('should return 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/prescriptions')
      .send({
        patientId: 1 // Missing details
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('patientId and details are required.');
  });
});
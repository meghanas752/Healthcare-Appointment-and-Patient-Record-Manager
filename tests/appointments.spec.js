// tests/appointments.spec.js
const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

process.env.NODE_ENV = 'test';

describe('GET /api/appointments/doctor/:name', () => {

  afterAll(async () => {
    await pool.end(); // Close all connections
  });

  test('should return 2 appointments for doctor "megh"', async () => {
    // This test is based on your database screenshot
    const response = await request(app)
      .get('/api/appointments/doctor/megh'); 

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Your DB screenshot shows 2 appointments for 'megh'
    expect(response.body.length).toBe(2); 
    expect(response.body[0].patient_name).toBe('jack'); // 'jack' is at 08:28:00
  });

  test('should return 1 appointment for doctor "alice"', async () => {
    const response = await request(app)
      .get('/api/appointments/doctor/alice');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].patient_name).toBe('megha');
  });

  test('should return an empty array for a doctor with no appointments', async () => {
    const response = await request(app)
      .get('/api/appointments/doctor/DrNobody');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });
});
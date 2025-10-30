// tests/history.spec.js
const request = require('supertest');
const app = require('../src/server/server.js'); // Import your Express app
const { pool } = require('../src/backend/db.js'); // Import the pool to close it after

// Set the environment to 'test'
process.env.NODE_ENV = 'test';

describe('GET /api/patients/:id/history', () => {

  // After all tests are done, close the database pool
  afterAll(async () => {
    await pool.end();
  });

  test('should return a list of history items for patient 1', async () => {
    const patientId = 1; // We know patient 1 has data from our SQL setup
    
    const response = await request(app)
      .get(`/api/patients/${patientId}/history`);
      
    // 1. Check for a 200 OK status
    expect(response.statusCode).toBe(200);
    
    // 2. Check that it returned an array
    expect(Array.isArray(response.body)).toBe(true);
    
    // 3. Check for specific items we inserted
    expect(response.body.length).toBe(5); // 2 diagnoses, 1 allergy, 2 prescriptions
    expect(response.body[0].type).toBe('Diagnosis'); // '2025-10-20' is most recent
    expect(response.body[0].details).toBe('Common Cold');
  });

  test('should return items in chronological (descending) order', async () => {
    const patientId = 1;
    const response = await request(app)
      .get(`/api/patients/${patientId}/history`);
      
    expect(response.statusCode).toBe(200);
    
    // Check that the dates are sorted correctly (most recent first)
    const dates = response.body.map(item => new Date(item.date));
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i+1].getTime());
    }
  });
  
  test('should return an empty array for a non-existent patient', async () => {
    const patientId = 999; // This patient does not exist
    const response = await request(app)
      .get(`/api/patients/${patientId}/history`);
      
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});
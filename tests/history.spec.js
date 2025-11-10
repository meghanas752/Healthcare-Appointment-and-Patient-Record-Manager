// tests/history.spec.js
const request = require('supertest');
const app = require('../src/server/server.js'); // Import your Express app
const { pool } = require('../src/backend/db.js'); // Import the pool to close it after

// Set the environment to 'test'
process.env.NODE_ENV = 'test';

describe('GET /api/patients/:id/history', () => {

 

  test('should return a list of history items for patient 1', async () => {
    const patientId = 1; // We know patient 1 has data from our SQL setup
    
    const response = await request(app)
      .get(`/api/patients/${patientId}/history`);
      
    // 1. Check for a 200 OK status
    expect(response.statusCode).toBe(200);
    
    // 2. Check that it returned an array
    expect(Array.isArray(response.body)).toBe(true);
    
    // 3. Check for specific items we inserted
    expect(response.body.length).toBeGreaterThanOrEqual(5); // Check for at least the 5 we know // 2 diagnoses, 1 allergy, 2 prescriptions
    // NEW ROBUST CHECKS:
    // We will find the items we expect, no matter where they are in the list.

    // 1. Check for the "Common Cold" diagnosis
    const commonCold = response.body.find(item => item.details === 'Common Cold');
    expect(commonCold).toBeDefined(); // Checks that it exists
    expect(commonCold.type).toBe('Diagnosis');

    // 2. Check for the "Ankle Brace" prescription
    const ankleBrace = response.body.find(item => item.details === 'Ankle Brace');
    expect(ankleBrace).toBeDefined(); // Checks that it exists
    expect(ankleBrace.type).toBe('Prescription');
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


describe('GET /api/patients/search', () => {

  // afterAll() is already defined, so we don't need it again

  test('should find patient "Priya Sharma" and return her history', async () => {
    const name = "Priya Sharma";
    const response = await request(app)
      .get(`/api/patients/search?name=${encodeURIComponent(name)}`); // Use encodeURIComponent for names with spaces

    expect(response.statusCode).toBe(200);
    expect(response.body.patient.id).toBe(2); // Should be patient 2
    expect(response.body.history.length).toBeGreaterThanOrEqual(3);
    expect(response.body.history[0].details).toBe('Seasonal Allergies');
  });

  test('should return 404 for a non-existent patient name', async () => {
    const name = "Fake Name";
    const response = await request(app)
      .get(`/api/patients/search?name=${name}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Patient not found.');
  });
  
  test('should return 400 if no name query is provided', async () => {
    const response = await request(app)
      .get(`/api/patients/search`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Patient name query is required.');
  });

});


afterAll(async () => {
  await pool.end();
});
const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

process.env.NODE_ENV = 'test';

afterAll(async () => {
  await pool.end();
});

describe('GET /api/appointments/doctor/:name', () => {

  test('doctor "megh" should return at least 1 appointment', async () => {
    const response = await request(app).get('/api/appointments/doctor/megh');

    expect(response.statusCode).toBe(200);
    // THIS IS THE FIX:
    // We check for "at least 1" instead of "exactly 1".
    // This will pass on your machine (which has 3) and your friend's (which has 1).
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    // This is a better check: does the list contain the patient we expect?
    const patientNames = response.body.map(a => a.patient_name);
    expect(patientNames).toContain('mai');
  });

  test('doctor "maitreyi" should return at least 2 appointments', async () => {
    const response = await request(app).get('/api/appointments/doctor/maitreyi');

    expect(response.statusCode).toBe(200);
    // THIS IS THE FIX:
    // We check for "at least 2". This passes on your machine (which has 2).
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    const patientNames = response.body.map(a => a.patient_name).sort();
    expect(patientNames).toContain('Charles');
    expect(patientNames).toContain('Meghana');
  });

  test('doctor "Alice" should return at least 1 appointment', async () => {
    const response = await request(app).get('/api/appointments/doctor/Alice');

    expect(response.statusCode).toBe(200);
    // THIS IS THE FIX:
    // We check for "at least 1".
    // This will pass on your machine (which has 2) and your friend's (which has 1).
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    // This is a better check:
    const patientNames = response.body.map(a => a.patient_name);
    expect(patientNames).toContain('Rhys');
  });

  test('doctor "megha" should return at least 2 appointments', async () => {
    const response = await request(app).get('/api/appointments/doctor/megha');

    expect(response.statusCode).toBe(200);
    // THIS IS THE FIX:
    // We check for "at least 2".
    // This will pass on your machine (which has 5) and your friend's (which has 2).
    expect(response.body.length).toBeGreaterThanOrEqual(2);

    // This is a better check:
    const names = response.body.map(r => r.patient_name).sort();
    expect(names).toContain('Priya');
    expect(names).toContain('Rhys');
  });

  test('doctor "mai" should return at least 1 appointment', async () => {
    const response = await request(app).get('/api/appointments/doctor/mai');

    expect(response.statusCode).toBe(200);
    // THIS IS THE FIX:
    // We check for "at least 1". This passes on your machine (which has 1).
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    
    const patientNames = response.body.map(a => a.patient_name);
    expect(patientNames).toContain('meg');
  });

  test('doctor with no appointments should return empty array', async () => {
    const response = await request(app).get('/api/appointments/doctor/DrNobody');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0); // This should always be 0
  });

});
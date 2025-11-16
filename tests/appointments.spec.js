// tests/appointments.spec.js
const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

process.env.NODE_ENV = 'test';

afterAll(async () => {
  await pool.end();
});

describe('GET /api/appointments/doctor/:name', () => {

  test('doctor "megh" should return 1 appointment', async () => {
    const response = await request(app).get('/api/appointments/doctor/megh');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].patient_name).toBe('mai');
  });

  test('doctor "maitreyi" should return 2 appointments', async () => {
    const response = await request(app).get('/api/appointments/doctor/maitreyi');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);

    const patientNames = response.body.map(a => a.patient_name).sort();

    expect(patientNames).toEqual(['Charles', 'Meghana'].sort());
  });

  test('doctor "Alice" should return 1 appointment', async () => {
    const response = await request(app).get('/api/appointments/doctor/Alice');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].patient_name).toBe('Rhys');
  });

  test('doctor "megha" should return 2 appointments', async () => {
    const response = await request(app).get('/api/appointments/doctor/megha');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);

    const names = response.body.map(r => r.patient_name).sort();
    expect(names).toEqual(['Priya', 'Rhys'].sort());
  });

  test('doctor "mai" should return 1 appointment', async () => {
    const response = await request(app).get('/api/appointments/doctor/mai');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].patient_name).toBe('meg');
  });

  test('doctor with no appointments should return empty array', async () => {
    const response = await request(app).get('/api/appointments/doctor/DrNobody');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

});

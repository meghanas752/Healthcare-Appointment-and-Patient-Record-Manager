// tests/beds-missing-fields.spec.js
const request = require('supertest');
const app = require('../src/server/server');

// ------------------------------
// CASE 1: Missing Fields (400)
// ------------------------------
describe("Beds API Missing Fields", () => {
  test("should return 400 when appointmentId or bedId is missing", async () => {
    const res = await request(app)
      .post('/api/beds/assign')
      .send({}); 

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Appointment ID and Bed ID are required.");
  });
});

// ------------------------------
// CASE 2: DB ERROR (500)
// ------------------------------
jest.mock('../src/backend/db.js', () => ({
  pool: { 
    query: jest.fn(() => { 
      throw new Error("DB fail");
    }) 
  }
}));

describe("Beds API DB Failure", () => {
  test("should return 500 when database fails", async () => {
    const res = await request(app)
      .post('/api/beds/assign')
      .send({ patientId: 1, bedId: 2 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to assign bed.");
  });
});

const request = require('supertest');
const app = require('../src/server/server.js'); // Path to your server file
const { pool } = require('../src/backend/db.js'); // Path to your db file

// We spy on the 'query' function of the imported pool
jest.spyOn(pool, 'query');

describe('Billing API Route', () => {

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 200 and a correct bill on success', async () => {
    // 1. Arrange
    const mockData = {
      consultations: [[{ item: 'Consultation', cost: 100 }]],
      medicines: [[{ item: 'Medicine', cost: 50 }]],
      treatments: [[{ item: 'Treatment', cost: 75 }]],
      allergies: [[{ item: 'Allergy Test', cost: 0 }]],
      diagnoses: [[{ item: 'Diagnosis', cost: 0 }]]
    };

    // Mock 5 successful query calls, one after another
    pool.query
      .mockResolvedValueOnce(mockData.consultations)
      .mockResolvedValueOnce(mockData.medicines)
      .mockResolvedValueOnce(mockData.treatments)
      .mockResolvedValueOnce(mockData.allergies)
      .mockResolvedValueOnce(mockData.diagnoses);

    // 2. Act
    const res = await request(app).get('/api/billing/1');

    // 3. Assert
    expect(res.status).toBe(200);
    expect(res.body.total).toBe('225.00'); // 100 + 50 + 75
    expect(pool.query).toHaveBeenCalledTimes(5);
  });

  test('should return 500 when the database fails', async () => {
    // 1. Arrange
    // Mock the *first* query call to throw an error
    pool.query.mockRejectedValue(new Error('Database connection failed'));

    // 2. Act
    const res = await request(app).get('/api/billing/1');

    // 3. Assert
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Database error occurred.');
    expect(pool.query).toHaveBeenCalledTimes(1); // It only tried once
  });

});
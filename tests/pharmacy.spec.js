const request = require('supertest');
const app = require('../src/server/server.js'); // Path to your server file
const { pool } = require('../src/backend/db.js'); // Path to your db file

// We spy on the 'query' function of the imported pool
jest.spyOn(pool, 'query');

describe('Pharmacy API Routes', () => {

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /pharmacy/inventory ---
  describe('GET /pharmacy/inventory', () => {
    // This test passes (and is correct) because this route sends JSON
    test('should return 500 when the database fails', async () => {
      // 1. Arrange
      pool.query.mockRejectedValue(new Error('DB Error'));

      // 2. Act
      const res = await request(app).get('/pharmacy/inventory');

      // 3. Assert
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error loading inventory');
    });
  });

  // --- POST /pharmacy/restock ---
  describe('POST /pharmacy/restock', () => {
    test('should return 400 for invalid input (qty <= 0)', async () => {
      // 1. Arrange
      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'TEST', qty: 0 });

      // 2. Assert
      expect(res.status).toBe(400);
      // FIX: Check res.text
      expect(res.text).toBe('drug_code and positive qty are required');
    });

    test('should return 404 if drug code not found on update', async () => {
      // 1. Arrange
      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }]) // 1. INSERT succeeds
        .mockResolvedValueOnce([{ affectedRows: 0 }]); // 2. UPDATE fails (0 rows)
      
      // 2. Act
      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'NOT_FOUND', qty: 10 });

      // 3. Assert
      expect(res.status).toBe(404);
      // FIX: Check res.text
      expect(res.text).toBe('Drug code not found');
    });

    test('should return 500 when database fails', async () => {
      // 1. Arrange
      pool.query.mockRejectedValue(new Error('DB Error')); // 1. INSERT fails

      // 2. Act
      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'TEST', qty: 10 });
      
      // 3. Assert
      expect(res.status).toBe(500);
      // FIX: Check res.text
      expect(res.text).toBe('Error restocking medicine');
    });
  });

  // --- POST /pharmacy/dispense ---
  describe('POST /pharmacy/dispense', () => {
    test('should return 400 for invalid input (qty <= 0)', async () => {
      // 1. Arrange
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'TEST', qty: 0 });

      // 2. Assert
      expect(res.status).toBe(400);
      // FIX: Check res.text
      expect(res.text).toBe('drug_code and positive qty are required');
    });

    test('should return 404 if drug code not found', async () => {
      // 1. Arrange
      pool.query.mockResolvedValue([[]]); // 1. SELECT returns empty array

      // 2. Act
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'NOT_FOUND', qty: 10 });
      
      // 3. Assert
      expect(res.status).toBe(404);
      // FIX: Check res.text
      expect(res.text).toBe('Drug code not found');
    });

    test('should return 400 for insufficient stock', async () => {
      // 1. Arrange
      pool.query.mockResolvedValue([[{ stock: 5 }]]); // 1. SELECT finds 5 in stock

      // 2. Act
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'LOW_STOCK', qty: 10 }); // Try to dispense 10
      
      // 3. Assert
      expect(res.status).toBe(400);
      // FIX: Check res.text
      expect(res.text).toBe('Insufficient stock');
    });

    test('should return 500 when database fails', async () => {
      // 1. Arrange
      pool.query
        .mockResolvedValueOnce([[{ stock: 20 }]]) // 1. SELECT finds 20 in stock
        .mockRejectedValue(new Error('DB Error')); // 2. UPDATE fails
      
      // 2. Act
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'TEST', qty: 10 });
      
      // 3. Assert
      expect(res.status).toBe(500);
      // FIX: Check res.text
      expect(res.text).toBe('Error dispensing medicine');
    });
  });

});
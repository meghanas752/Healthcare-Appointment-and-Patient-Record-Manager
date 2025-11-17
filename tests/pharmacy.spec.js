// tests/pharmacy.spec.js
const request = require('supertest');
const app = require('../src/server/server.js');
const { pool } = require('../src/backend/db.js');

// Spy on pool.query
jest.spyOn(pool, 'query');

describe('Pharmacy API Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== INVENTORY ====================
  describe('GET /pharmacy/inventory', () => {
    test('should return 500 when the database fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app).get('/pharmacy/inventory');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error loading inventory');
    });
  });

  // ==================== RESTOCK ====================
  describe('POST /pharmacy/restock', () => {

    test('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'TEST', qty: 0 }); // missing price

      expect(res.status).toBe(400);
      expect(res.text).toBe('drug_code, qty and price are required');
    });

    test('should always return 200 because server never checks affectedRows', async () => {
      // Both DB calls succeed
      pool.query.mockResolvedValueOnce([{ insertId: 1 }, []]); // insert
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }, []]); // update result ignored

      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'NOT_FOUND', qty: 10, price: 9.99 });

      // Server ALWAYS returns 200 because of:
      // res.send("Restock successful!")
      expect(res.status).toBe(200);
      expect(res.text).toBe('Restock successful!');
    });

    test('should return 500 when database fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'TEST', qty: 10, price: 9.99 });

      // Server sends plain text "Error restocking medicine"
      expect(res.status).toBe(500);
      expect(res.text).toBe('Error restocking medicine');
    });
  });

  // ==================== DISPENSE ====================
  describe('POST /pharmacy/dispense', () => {

    test('should return 400 for invalid input (qty <= 0)', async () => {
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'TEST', qty: 0 });

      expect(res.status).toBe(400);
      expect(res.text).toBe('drug_code and positive qty are required');
    });

    test('should return 404 if drug code not found', async () => {
      pool.query.mockResolvedValueOnce([[], []]); // SELECT returns no rows

      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'NOT_FOUND', qty: 10 });

      expect(res.status).toBe(404);
      expect(res.text).toBe('Drug code not found');
    });

    test('should return 400 for insufficient stock', async () => {
      pool.query.mockResolvedValueOnce([[{ stock: 5 }], []]);

      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'LOW_STOCK', qty: 10 });

      expect(res.status).toBe(400);
      expect(res.text).toBe('Insufficient stock');
    });

    test('should return 500 when database fails', async () => {
      pool.query.mockResolvedValueOnce([[{ stock: 20 }], []]); // SELECT ok
      pool.query.mockRejectedValueOnce(new Error('DB Error')); // UPDATE error

      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'TEST', qty: 10 });

      expect(res.status).toBe(500);
      expect(res.text).toBe('Error dispensing medicine');
    });
  });
});

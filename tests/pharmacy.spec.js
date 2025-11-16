const request = require('supertest');
const app = require('../src/server/server.js'); 
const { pool } = require('../src/backend/db.js'); 

jest.spyOn(pool, 'query');

describe('Pharmacy API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /pharmacy/inventory ---
  describe('GET /pharmacy/inventory', () => {
    test('should return 500 when the database fails', async () => {
      pool.query.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/pharmacy/inventory');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Error loading inventory');
    });
  });

  // --- POST /pharmacy/restock ---
  describe('POST /pharmacy/restock', () => {
    test('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'TEST', qty: 0 }); // Missing price
      expect(res.status).toBe(400);
      expect(res.text).toBe('drug_code, qty and price are required');
    });

    // --- THIS TEST IS THE FIX ---
    test('should return 404 if drug code not found on update', async () => {
      pool.query
        .mockResolvedValueOnce([ { insertId: 1 }, [] ]) 
        // FIX: The mock for an UPDATE must be an object, not an array
        .mockResolvedValueOnce([ { affectedRows: 0 }, [] ]); 
      
      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'NOT_FOUND', qty: 10, price: 9.99 });

      expect(res.status).toBe(404);
      expect(res.text).toBe('Drug code not found');
    });

    test('should return 500 when database fails', async () => {
      pool.query.mockRejectedValue(new Error('DB Error')); 
      const res = await request(app)
        .post('/pharmacy/restock')
        .send({ drug_code: 'TEST', qty: 10, price: 9.99 });
      expect(res.status).toBe(500);
      expect(res.text).toBe('Error restocking medicine');
    });
  });

  // --- POST /pharmacy/dispense ---
  describe('POST /pharmacy/dispense', () => {
    // ... (This part was passing, no changes needed) ...
    test('should return 400 for invalid input (qty <= 0)', async () => {
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'TEST', qty: 0 });
      expect(res.status).toBe(400);
      expect(res.text).toBe('drug_code and positive qty are required');
    });

    test('should return 404 if drug code not found', async () => {
      pool.query.mockResolvedValue([ [], [] ]); 
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'NOT_FOUND', qty: 10 });
      expect(res.status).toBe(404);
      expect(res.text).toBe('Drug code not found');
    });

    test('should return 400 for insufficient stock', async () => {
      pool.query.mockResolvedValue([ [{ stock: 5 }], [] ]); 
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'LOW_STOCK', qty: 10 });
      expect(res.status).toBe(400);
      expect(res.text).toBe('Insufficient stock');
    });

    test('should return 500 when database fails', async () => {
      pool.query
        .mockResolvedValueOnce([ [{ stock: 20 }], [] ]) 
        .mockRejectedValue(new Error('DB Error')); 
      const res = await request(app)
        .post('/pharmacy/dispense')
        .send({ drug_code: 'TEST', qty: 10 });
      expect(res.status).toBe(500);
      expect(res.text).toBe('Error dispensing medicine');
    });
  });
});
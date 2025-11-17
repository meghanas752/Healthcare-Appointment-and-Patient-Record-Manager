// Import the 'mysql/promise' module so we can mock it
const mysql = require('mysql2/promise');

// --- The Simple Test Setup ---
// We mock the 'mysql2/promise' library.
// This means Jest will replace the real library with our fake version.
const mockPool = {
  query: jest.fn(), // We create a mock 'query' function
};

jest.mock('mysql2/promise', () => ({
  // When 'createPool' is called, we return our fake pool
  createPool: jest.fn(() => mockPool), 
}));

// NOW we import the db functions.
// When db.js runs, its 'createPool' call will get our mockPool.
const db = require('../src/backend/db.js'); 

describe('Database Function Unit Tests', () => {

  // Reset the mock before each test
  beforeEach(() => {
    mockPool.query.mockReset(); 
  });

  test('getAppointmentDetails should fetch and combine details', async () => {
    // 1. Arrange
    const fakeAppt = { id: 1, date: '2025-01-20' };
    const fakeTreatments = [{ details: 'Checkup' }];
    const fakePrescriptions = [{ details: 'Meds' }];

    mockPool.query
      .mockResolvedValueOnce([[fakeAppt]])
      .mockResolvedValueOnce([fakeTreatments])
      .mockResolvedValueOnce([fakePrescriptions]);

    // 2. Act
    const details = await db.getAppointmentDetails(1);

    // 3. Assert
    expect(mockPool.query).toHaveBeenCalledTimes(3);
    expect(details).toEqual({
      appointment: fakeAppt,
      treatments: fakeTreatments,
      prescriptions: fakePrescriptions
    });
  });

  test('createTreatment should insert a new treatment', async () => {
    // 1. Arrange
    const fakeInsertResult = { insertId: 123 };
    mockPool.query.mockResolvedValue([fakeInsertResult]);

    // 2. Act
    const result = await db.createTreatment(1, 'Test Treatment', 100);

    // 3. Assert
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO treatments'), // Check SQL
      [1, 'Test Treatment', 100] // Check parameters
    );
    expect(result).toEqual({ id: 123 });
  });

  // --- NEW SIMPLE TESTS ---

  test('incrementFailedAttempts should update the user', async () => {
    // 1. Arrange
    const fakeUpdateResult = { affectedRows: 1 };
    mockPool.query.mockResolvedValue([fakeUpdateResult]);
    const testUserId = 5;

    // 2. Act
    await db.incrementFailedAttempts(testUserId);

    // 3. Assert
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET failed_attempts'), // Check SQL
      [testUserId] // Check parameters
    );
  });

  test('resetFailedAttempts should reset user attempts', async () => {
    // 1. Arrange
    const fakeUpdateResult = { affectedRows: 1 };
    mockPool.query.mockResolvedValue([fakeUpdateResult]);
    const testUserId = 5;

    // 2. Act
    await db.resetFailedAttempts(testUserId);

    // 3. Assert
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET failed_attempts = 0'), // Check SQL
      [testUserId] // Check parameters
    );
  });

});
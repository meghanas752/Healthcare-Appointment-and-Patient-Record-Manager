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
    jest.restoreAllMocks(); // This clears spies
  });

  // --- Test for getPatientHistoryByName (Happy Path) ---
  test('getPatientHistoryByName should return patient and history', async () => {
    // 1. Arrange
    const fakePatient = { id: 1, name: 'Test Patient' };
    // We add a date so the sort function works
    const fakeHistoryItems = [{ details: 'History Item', date: new Date() }];

    // --- THIS IS THE FIX ---
    // We must mock ALL queries that will be called.
    mockPool.query
      // 1. The query inside getPatientHistoryByName (finds the patient)
      .mockResolvedValueOnce([[fakePatient]])
      // 2. The *first* query inside getPatientHistory (diagnoses)
      .mockResolvedValueOnce([fakeHistoryItems])
      // 3. The *second* query inside getPatientHistory (allergies)
      .mockResolvedValueOnce([[]])
      // 4. The *third* query inside getPatientHistory (prescriptions)
      .mockResolvedValueOnce([[]]);
    
    // 2. Act
    const result = await db.getPatientHistoryByName('Test Patient');

    // 3. Assert
    expect(result.patient).toEqual(fakePatient);
    // It will return the sorted history
    expect(result.history).toEqual(fakeHistoryItems); 
    // It should have made 1 + 3 = 4 queries
    expect(mockPool.query).toHaveBeenCalledTimes(4);
  });

  // --- Test for getPatientHistoryByName (Sad Path) ---
  test('getPatientHistoryByName should return null if patient not found', async () => {
    // 1. Arrange
    // Mock the first query (find patient) to return an empty array
    mockPool.query.mockResolvedValueOnce([[]]);

    // 2. Act
    const result = await db.getPatientHistoryByName('Unknown Patient');

    // 3. Assert
    expect(result.patient).toBe(null);
    expect(result.history).toEqual([]);
    // Only the first query was called
    expect(mockPool.query).toHaveBeenCalledTimes(1); 
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

  test('getAppointmentDetails should throw error if appt not found', async () => {
    // 1. Arrange
    mockPool.query.mockResolvedValueOnce([[]]);

    // 2. Act & 3. Assert
    await expect(db.getAppointmentDetails(999))
      .rejects
      .toThrow('Appointment not found.');
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
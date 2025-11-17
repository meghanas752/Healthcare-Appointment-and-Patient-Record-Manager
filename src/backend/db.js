// src/backend/db.js
// This file handles ALL database connections and queries

require('dotenv').config({ path: __dirname + '/../server/.env' }); 
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); // Use bcryptjs to match your teammate's code
const saltRounds = 10;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Fetches all diagnoses, allergies, and prescriptions for a single patient
 */
async function getPatientHistory(patientId) {
  // This queries the 'patients' table (ID 1-4)
  const [diagnoses] = await pool.query(
    'SELECT details, date, "Diagnosis" as type FROM diagnoses WHERE patientId = ?',
    [patientId]
  );
  
  const [allergies] = await pool.query(
    'SELECT details, date, "Allergy" as type FROM allergies WHERE patientId = ?',
    [patientId]
  );
  
  const [prescriptions] = await pool.query(
    'SELECT details, date, "Prescription" as type FROM prescriptions WHERE patientId = ?',
    [patientId]
  );

  const combinedHistory = [...diagnoses, ...allergies, ...prescriptions];
  combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  return combinedHistory;
}


/**
 * Searches for a patient by exact name
 */
async function getPatientHistoryByName(patientName) {
  // NOTE: This queries the 'patients' table (ID 1-4)
  const [patientRows] = await pool.query(
    'SELECT id FROM patients WHERE name = ? LIMIT 1',
    [patientName]
  );

  if (!patientRows || patientRows.length === 0) {
    return { patient: null, history: [] };
  }

  const patient = patientRows[0];
  const patientId = patient.id;
  const history = await getPatientHistory(patientId);
  return { patient, history };
}


// ***** NEW FUNCTION FOR LOGIN *****
/**
 * Finds a user by their username OR email.
 * This queries the 'users' table.
 */
async function findUserByEmailOrUsername(identifier) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows[0]; // Will be undefined if not found
}

// ***** NEW FUNCTION FOR SIGNUP *****
/**
 * Creates a new user in the 'users' table.
 */
async function createUser(userData) {
  const { username, email, password_hash, role } = userData;
  
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password_hash, role, failed_attempts, is_locked) VALUES (?, ?, ?, ?, 0, 0)',
    [username, email, password_hash, role]
  );

  return { id: result.insertId, username: username, email: email, role: role };
}

// ***** NEW FUNCTIONS FOR LOCKOUT (Your Task) *****
/**
 * Increments the failed login count for a user.
 */
async function incrementFailedAttempts(userId) {
  await pool.query(
    'UPDATE users SET failed_attempts = failed_attempts + 1, last_failed_at = NOW() WHERE id = ?',
    [userId]
  );
}

/**
 * Resets the failed login count for a user upon successful login.
 */
async function resetFailedAttempts(userId) {
  await pool.query(
    'UPDATE users SET failed_attempts = 0, last_failed_at = NULL, lockout_until = NULL WHERE id = ?',
    [userId]
  );
}

// ***** REPLACE THIS FUNCTION *****

/**
 * Fetches all appointments for a specific doctor, ordered by date and time.
 * (FIXED: Using the correct 'appointment_time' spelling)
 */
async function getAppointmentsByDoctorName(doctorName) {
  const [rows] = await pool.query(
    // THE FIX is on this line:
    'SELECT * FROM appointments WHERE doctor_name = ? ORDER BY appointment_date, appointment_time',
    [doctorName]
  );
  return rows;
}

// ***** ADD THESE TWO NEW FUNCTIONS *****

/**
 * Fetches all details for a single appointment,
 * including prescriptions and treatments.
 */
async function getAppointmentDetails(appointmentId) {
  // 1. Get the main appointment info
  const [apptRows] = await pool.query(
    'SELECT * FROM appointments WHERE id = ?',
    [appointmentId]
  );
  
  if (apptRows.length === 0) {
    throw new Error('Appointment not found.');
  }
  const appointment = apptRows[0];

  // 2. Get all treatments for this appointment
  const [treatments] = await pool.query(
    'SELECT * FROM treatments WHERE appointment_id = ?',
    [appointmentId]
  );

  // 3. Get all prescriptions for this appointment
  const [prescriptions] = await pool.query(
    'SELECT * FROM prescriptions WHERE appointment_id = ?',
    [appointmentId]
  );

  // 4. Combine them into one object
  return {
    appointment,
    treatments,
    prescriptions
  };
}


/**
 * Creates a new prescription and links it to an appointment.
 * (This REPLACES your old createPrescription function)
 */
async function createPrescription(appointmentId, details, cost) {
  const [result] = await pool.query(
    // Your new 'prescriptions' table has 'cost' and 'date'
    'INSERT INTO prescriptions (appointment_id, details, cost, date) VALUES (?, ?, ?, CURDATE())',
    [appointmentId, details, cost]
  );
  return { id: result.insertId };
}


// ***** ADD THIS NEW FUNCTION *****

/**
 * Creates a new treatment in the database.
 */
async function createTreatment(appointmentId, details, cost) {
  const [result] = await pool.query(
    // Your 'treatments' table has 'cost' and 'date'
    'INSERT INTO treatments (appointment_id, details, cost, date) VALUES (?, ?, ?, CURDATE())',
    [appointmentId, details, cost]
  );
  return { id: result.insertId };
}


// Export all functions at the very bottom
module.exports = {
  pool,
  getPatientHistory,
  getPatientHistoryByName,
  createPrescription,
  findUserByEmailOrUsername, // <-- Now this function exists for your server
  createUser,                // <-- Now this function exists for your server
  incrementFailedAttempts,   // <-- And your new functions are here
  resetFailedAttempts,
  getAppointmentsByDoctorName,
  getAppointmentDetails,
  createPrescription,
  createTreatment
};
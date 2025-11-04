// src/backend/db.js
// This file handles all database connections and queries

require('dotenv').config({ path: __dirname + '/../server/.env' }); 
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // This is needed for registerPatient
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

/**
 * Creates a new prescription in the database.
 */
async function createPrescription(patientId, details) {
  const [result] = await pool.query(
    'INSERT INTO prescriptions (patientId, date, details) VALUES (?, CURDATE(), ?)',
    [patientId, details]
  );
  return { id: result.insertId };
}


// ***** THIS IS THE MISSING FUNCTION *****
/**
 * Creates a new patient in the database.
 * Hashes the password with bcrypt.
 */
async function registerPatient(patientData) {
  const { name, email, password, phone, dob } = patientData;

  const [existing] = await pool.query(
    'SELECT id FROM patients WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    throw new Error('Email already in use.'); 
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const [result] = await pool.query(
    'INSERT INTO patients (name, email, password, phone, dob) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, phone, dob]
  );

  return { id: result.insertId, name: name, email: email };
}
// ***** END OF MISSING FUNCTION *****


// Export all functions at the very bottom
module.exports = {
  pool,
  getPatientHistory,
  getPatientHistoryByName,
  registerPatient, // Now this function exists!
  createPrescription
};
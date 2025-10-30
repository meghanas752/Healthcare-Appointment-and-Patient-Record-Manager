// src/backend/db.js
// This file handles all database connections and queries

// Note the path to the .env file, relative from this file
require('dotenv').config({ path: __dirname + '/../server/.env' }); 
const mysql = require('mysql2/promise');

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
 * and returns them sorted by date.
 */
async function getPatientHistory(patientId) {
  // We run all three queries in parallel for speed
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

  // Combine all results into one array
  const combinedHistory = [...diagnoses, ...allergies, ...prescriptions];

  // Sort the array by date, most recent first (as per user story)
  combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

  return combinedHistory;
}


/**
 * Searches for a patient by exact name, gets their ID,
 * and then returns their complete history.
 */
async function getPatientHistoryByName(patientName) {
  // 1. Find the patient's ID
  const [patientRows] = await pool.query(
    'SELECT id FROM patients WHERE name = ? LIMIT 1',
    [patientName]
  );

  if (!patientRows || patientRows.length === 0) {
    // No patient found with that name
    return { patient: null, history: [] };
  }

  const patient = patientRows[0];
  const patientId = patient.id;

  // 2. Get their history using the function we already built
  const history = await getPatientHistory(patientId);

  return { patient, history };
}


// **THIS IS THE FIX:**
// The module.exports block is now at the end of the file,
// after all functions have been defined.
module.exports = {
  pool, // Export pool for other files to use
  getPatientHistory,
  getPatientHistoryByName 
};
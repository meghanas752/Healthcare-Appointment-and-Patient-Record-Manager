// This file handles all database connections and queries

// Note the path to the .env file
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

module.exports = {
  pool, // Export pool for other files to use
  getPatientHistory
};
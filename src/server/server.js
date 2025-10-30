// src/server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Update this path to be correct relative to server.js
// **THIS IS THE FIX:** Make sure BOTH functions are imported
const { getPatientHistory, getPatientHistoryByName } = require('../backend/db.js'); 

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your frontend (in src/web) to call this backend
app.use(express.json());

// --- YOUR ORIGINAL API ENDPOINT (keep this) ---
app.get('/api/patients/:id/history', async (req, res) => {
  try {
    const patientId = req.params.id;
    const history = await getPatientHistory(patientId);
    
    // Send back the history (it will be an empty array if no user)
    res.json(history);

  } catch (error) {
    console.error('Database error fetching patient history:', error);
    res.status(500).json({ message: 'Error fetching patient data.' });
  }
});

// --- YOUR NEW SEARCH API ENDPOINT ---
app.get('/api/patients/search', async (req, res) => {
  try {
    const patientName = req.query.name; // Gets name from URL like ?name=David%20Lee

    if (!patientName) {
      return res.status(400).json({ message: 'Patient name query is required.' });
    }

    // **THIS IS THE FIX:** Call the function you imported
    const { patient, history } = await getPatientHistoryByName(patientName);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' }); // 404 for Not Found
    }
    
    // Send back both the patient info and their history
    res.json({ patient, history });

  } catch (error) {
    console.error('Database error during patient search:', error);
    res.status(500).json({ message: 'Error searching for patient.' });
  }
});


// --- (Your team's other routes like /api/auth/login go here) ---
// ...

// Start Server (but not when testing)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app; // Export 'app' for our integration tests
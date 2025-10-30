// src/server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Update this path if your db.js is located differently
const { getPatientHistory } = require('../backend/db.js'); 

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your frontend (in src/web) to call this backend
app.use(express.json());

// --- YOUR NEW API ENDPOINT ---
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

// --- (Your team's other routes like /api/auth/login go here) ---
// ...

// Start Server (but not when testing)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app; // Export 'app' for our integration tests
// routes/patients.js

// routes/patients.js

const express = require('express');
const router = express.Router();
// This path says: "Go UP ONE FOLDER from here, then find db-config.js"
const db = require('../db-config');
router.post('/register', (req, res) => {
    // 1. Get ALL the data from the incoming request, including the new fields.
    const { firstName, lastName, phone, medicalHistory, currentMedications } = req.body;

    // 2. Basic validation (can be improved later)
    if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required.' });
    }

    // 3. Create an object that matches ALL the columns in your updated database table.
    const newPatient = {
        name: `${firstName} ${lastName}`,
        phone_number: phone,
        medical_history: medicalHistory,
        current_medications: currentMedications
    };

    const sql = 'INSERT INTO patients SET ?';

    db.query(sql, newPatient, (err, result) => {
        if (err) {
            console.error('Error inserting patient:', err);
            return res.status(500).json({ error: 'A database error occurred.' });
        }
        
        console.log('1 patient record inserted with full details, ID: ', result.insertId);
        res.status(201).json({ 
            message: 'Patient registered successfully!', 
            patientId: result.insertId 
        });
    });
});

// NEW API Endpoint: GET all patients who are not assigned to a bed
// URL: GET /api/patients/unassigned
router.get('/unassigned', (req, res) => {
    const sql = 'SELECT id, name FROM patients WHERE bed_id IS NULL';

    db.query(sql, (err, patients) => {
        if (err) {
            console.error('Error fetching unassigned patients:', err);
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        res.json(patients); // Send the list of patients back
    });
});

module.exports = router; // This should now be at the very bottom
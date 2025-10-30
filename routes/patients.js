// routes/patients.js

const express = require('express');
const router = express.Router();
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

module.exports = router;
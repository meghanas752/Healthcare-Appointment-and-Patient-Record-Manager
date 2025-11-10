// routes/patients.js
const express = require('express');
const router = express.Router();
// We now import the team's 'pool' from their official db.js file
const { pool } = require('../src/backend/db.js');

router.post('/register', async (req, res) => { // Made this async
    try {
        const { firstName, lastName, phone, medicalHistory, currentMedications } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'First name and last name are required.' });
        }

        const newPatient = {
            name: `${firstName} ${lastName}`,
            phone_number: phone,
            medical_history: medicalHistory,
            current_medications: currentMedications
        };

        const sql = 'INSERT INTO patients SET ?';
        // Use the new async/await syntax
        const [result] = await pool.query(sql, newPatient);

        console.log('1 patient record inserted with full details, ID: ', result.insertId);
        res.status(201).json({
            message: 'Patient registered successfully!',
            patientId: result.insertId
        });
    } catch (err) {
        console.error('Error inserting patient:', err);
        return res.status(500).json({ error: 'A database error occurred.' });
    }
});

// THIS IS THE MODIFIED ROUTE
router.get('/unassigned', async (req, res) => { // Made this async
    try {
        // This SQL now selects from the 'appointments' table
        // It selects the appointment ID and the patient_name
        // It renames 'patient_name' to 'name' so the frontend doesn't break
        const sql = 'SELECT id, patient_name AS name FROM appointments WHERE bed_id IS NULL';
        
        const [patients] = await pool.query(sql);
        res.json(patients);
    } catch (err) {
        console.error('Error fetching unassigned appointments:', err);
        return res.status(500).json({ error: 'Database error occurred.' });
    }
});

module.exports = router;
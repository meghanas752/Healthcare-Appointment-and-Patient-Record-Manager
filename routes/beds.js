// routes/beds.js

// routes/beds.js

const express = require('express');
const router = express.Router();
// This path also needs to go UP ONE FOLDER
const db = require('../db-config');

// API Endpoint #1: GET all beds and their status
// This will be used to show the nurse a list of available beds.
// URL: GET /api/beds
router.get('/', (req, res) => {
    // We use a JOIN to get the ward name along with the bed details
    const sql = `
        SELECT 
            beds.id, 
            beds.bed_number, 
            beds.is_occupied, 
            wards.name AS ward_name 
        FROM beds 
        JOIN wards ON beds.ward_id = wards.id
        ORDER BY wards.name, beds.bed_number;
    `;

    db.query(sql, (err, beds) => {
        if (err) {
            console.error('Error fetching beds:', err);
            return res.status(500).json({ error: 'Database error occurred.' });
        }
        res.json(beds); // Send the list of beds back as JSON
    });
});

// API Endpoint #2: ASSIGN a patient to a bed
// This will be used when the nurse clicks "Assign" for a patient.
// URL: POST /api/beds/assign
router.post('/assign', (req, res) => {
    const { patientId, bedId } = req.body;

    if (!patientId || !bedId) {
        return res.status(400).json({ error: 'Patient ID and Bed ID are required.' });
    }

    // We need to do two things:
    // 1. Update the patient's record with the bed_id.
    // 2. Mark the bed as occupied.
    // We will do this as two separate queries for simplicity. A transaction would be better for a production app.

    // Query 1: Update the patients table
    const updatePatientSql = 'UPDATE patients SET bed_id = ? WHERE id = ?';
    db.query(updatePatientSql, [bedId, patientId], (err, result) => {
        if (err) {
            console.error('Error assigning bed to patient:', err);
            return res.status(500).json({ error: 'Failed to update patient record.' });
        }

        // Query 2: Update the beds table
        const updateBedSql = 'UPDATE beds SET is_occupied = TRUE WHERE id = ?';
        db.query(updateBedSql, [bedId], (err, result) => {
            if (err) {
                console.error('Error marking bed as occupied:', err);
                // This is a partial failure, might need more robust handling in a real app
                return res.status(500).json({ error: 'Failed to mark bed as occupied.' });
            }

            res.json({ message: `Successfully assigned patient ${patientId} to bed ${bedId}.` });
        });
    });
});

module.exports = router;
// routes/beds.js
const express = require('express');
const router = express.Router();
// We also import the team's 'pool' here
const { pool } = require('../src/backend/db.js');

router.get('/', async (req, res) => { // Made this async
    try {
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
        // Use the new async/await syntax
        const [beds] = await pool.query(sql);
        res.json(beds);
    } catch (err) {
        console.error('Error fetching beds:', err);
        return res.status(500).json({ error: 'Database error occurred.' });
    }
});

// THIS IS THE MODIFIED ROUTE
router.post('/assign', async (req, res) => { // Made this async
    try {
        // 'patientId' from the frontend is now actually the 'appointmentId'
        const { patientId: appointmentId, bedId } = req.body;

        if (!appointmentId || !bedId) {
            return res.status(400).json({ error: 'Appointment ID and Bed ID are required.' });
        }

        // 1. Update the APPOINTMENTS table (instead of the patients table)
        const updateAppointmentSql = 'UPDATE appointments SET bed_id = ? WHERE id = ?';
        await pool.query(updateAppointmentSql, [bedId, appointmentId]);

        // 2. Update the beds table (this stays the same)
        const updateBedSql = 'UPDATE beds SET is_occupied = TRUE WHERE id = ?';
        await pool.query(updateBedSql, [bedId]);

        res.json({ message: `Successfully assigned appointment ${appointmentId} to bed ${bedId}.` });
    } catch (err) {
        console.error('Error assigning bed:', err);
        return res.status(500).json({ error: 'Failed to assign bed.' });
    }
});

module.exports = router;
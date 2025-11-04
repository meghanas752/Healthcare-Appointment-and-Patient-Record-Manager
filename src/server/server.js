// src/server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import DB functions and connection
const { pool, getPatientHistory, getPatientHistoryByName } = require('../backend/db.js'); 

// Import authentication and user model functions
//const { findByUsernameOrEmail } = require("./models/userModel.js");
const bcrypt = require("bcryptjs");
//const { createUser } = require("./models/userModel.js");

// ✅ User model helpers Mai
const {
  findByUsernameOrEmail,
  createUser,
  incrementFailedAttempts,
  resetFailedAttempts,
  lockAccount
} = require('./models/userModel.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

//Mai
const { isLocked, MAX_ATTEMPTS } = require('./services/lockout');

const bcrypt = require('bcryptjs');

// ---------------- EXISTING PATIENT ROUTES ----------------

app.get('/api/patients/:id/history', async (req, res) => {
  try {
    const patientId = req.params.id;
    const history = await getPatientHistory(patientId);
    res.json(history);
  } catch (error) {
    console.error('Database error fetching patient history:', error);
    res.status(500).json({ message: 'Error fetching patient data.' });
  }
});

app.get('/api/patients/search', async (req, res) => {
  try {
    const patientName = req.query.name;
    if (!patientName) {
      return res.status(400).json({ message: 'Patient name query is required.' });
    }

    const { patient, history } = await getPatientHistoryByName(patientName);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    res.json({ patient, history });
  } catch (error) {
    console.error('Database error during patient search:', error);
    res.status(500).json({ message: 'Error searching for patient.' });
  }
});

// ---------------- AUTH ROUTES ----------------

app.post('/api/auth/login', async (req, res) => {
  console.log('🔹 POST /api/auth/login');

  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ ok:false, code:'BAD_REQUEST', message:'Username/email and password are required.' });
  }

  try {
    const user = await findByUsernameOrEmail(identifier);
    if (!user) {
      // do not reveal existence
      return res.status(401).json({ ok:false, code:'BAD_CREDENTIALS', message:'Invalid username or password.' });
    }

    // 1) If currently locked, block
    const lock = isLocked(user);
    if (lock.locked) {
      return res.status(423).json({
        ok:false, code:'LOCKED', message:'Account locked. Try again later.', unlockAt: lock.unlockAt
      });
    }

    // 2) Check password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      // bump attempts in DB and read new count
      const attempts = await incrementFailedAttempts(user.id);

      if (attempts >= MAX_ATTEMPTS) {
        const unlockAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await lockAccount(user.id, unlockAt.toISOString());
        return res.status(423).json({
          ok:false, code:'LOCKED',
          message:'Too many attempts. Account locked for 15 minutes.',
          unlockAt
        });
      }

      return res.status(401).json({
        ok:false, code:'BAD_CREDENTIALS',
        message:'Invalid username or password.',
        attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts)
      });
    }

    // 3) Success → reset counters
    await resetFailedAttempts(user.id);
    return res.json({
      ok:true, message:'Login successful!',
      user: { username: user.username, email: user.email }
    });

  } catch (err) {
    console.error('❌ Error during login:', err);
    return res.status(500).json({ ok:false, code:'SERVER_ERROR', message:'Internal Server Error' });
  }
});

// ---------------- APPOINTMENT ROUTES (MySQL) ----------------

// ✅ Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// ✅ Add a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_name, doctor_name, appointment_date, appointment_time } = req.body;

    const [result] = await pool.query(
      'INSERT INTO appointments (patient_name, doctor_name, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
      [patient_name, doctor_name, appointment_date, appointment_time, 'Booked']
    );

    const newAppointment = {
      id: result.insertId,
      patient_name,
      doctor_name,
      appointment_date,
      appointment_time,
      status: 'Booked'
    };

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error inserting appointment:', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
});

// ✅ Delete an appointment by ID
app.delete('/api/appointments/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

  try {
    await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: `Appointment ${id} deleted` });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment.' });
  }
});

// ---------------------------------------------------------

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app;

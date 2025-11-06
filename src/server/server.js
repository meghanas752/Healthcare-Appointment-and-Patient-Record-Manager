// src/server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// Import DB functions and connection
// ** STEP 1: ADD createPrescription to the import list **
const { 
  pool, 
  getPatientHistory, 
  getPatientHistoryByName,
  createPrescription // <-- ADD THIS
} = require('../backend/db.js'); 

// Import authentication and user model functions
const { findByUsernameOrEmail } = require("./models/userModel.js");
const bcrypt = require("bcryptjs");
const { createUser } = require("./models/userModel.js");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- NEW STATIC FILE SERVING ---
// This tells Express to serve everything from the 'src' folder
app.use(express.static(path.join(__dirname, '..'))); // Goes up one level to 'src'
// --- END OF NEW STATIC FILE SERVING ---

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

app.post("/api/auth/login", async (req, res) => {
  console.log("🔹 Received POST /api/auth/login");

  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Username/email and password are required." });
  }

  try {
    const user = await findByUsernameOrEmail(identifier);
    if (!user) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid username or password." });
    }

    // ... (inside the login route)
    return res.json({
      status: "success",
      message: "Login successful!",
      user: { 
        username: user.username, 
        email: user.email, 
        role: user.role  // <-- ADD THIS LINE
      },
    });
// ...
  } catch (err) {
    console.error("❌ Error during login:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  console.log("🔹 Received POST /api/auth/signup");

  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required." });
  }

  try {
    const existingUser = await findByUsernameOrEmail(username);
    const existingEmail = await findByUsernameOrEmail(email);
    if (existingUser || existingEmail) {
      return res
        .status(409)
        .json({ status: "fail", message: "Username or email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await createUser({ username, email, password_hash, role });

    res.status(201).json({
      status: "success",
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Error during signup:", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
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

// ** STEP 2: ADD THE NEW PRESCRIPTION ROUTE **
// ---------------- PRESCRIPTION ROUTES ----------------

app.post('/api/prescriptions', async (req, res) => {
  try {
    // Note: We don't need doctorId because it's not in your SQL table
    const { patientId, details } = req.body;

    if (!patientId || !details) {
      return res.status(400).json({ message: 'patientId and details are required.' });
    }
    
    // Call your new DB function
    const newPrescription = await createPrescription(patientId, details);
    
    // 201 Created
    res.status(201).json(newPrescription); 

  } catch (error) {
    console.error('Database error creating prescription:', error);
    res.status(500).json({ message: 'Error creating prescription.' });
  }
});

// ---------------------------------------------------------

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app;
// src/server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
<<<<<<< Updated upstream
// Update this path to be correct relative to server.js
// **THIS IS THE FIX:** Make sure BOTH functions are imported
const { getPatientHistory, getPatientHistoryByName } = require('../backend/db.js'); 
const { findByUsernameOrEmail } = require("C:/Users/megha/OneDrive/Desktop/sem5/software_engineering/project/src/server/models/userModel.js"); // ✅ import here
const bcrypt = require("bcryptjs");
const { createUser } = require("./models/userModel.js"); // ✅ import here
=======

// Import DB functions and connection
const { pool, getPatientHistory, getPatientHistoryByName } = require('../backend/db.js'); 
>>>>>>> Stashed changes

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

<<<<<<< Updated upstream
app.post("/api/auth/login", async (req, res) => {
  console.log("🔹 Received POST /api/auth/login");

  const { identifier, password } = req.body;

  // Check if both fields are provided
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Username/email and password are required." });
  }

  try {
    // 1️⃣ Find user by username or email
    const user = await findByUsernameOrEmail(identifier);
    if (!user) {
      // User not found
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid username or password." });
    }

    // 2️⃣ Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Wrong password
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid username or password." });
    }

    // 3️⃣ Login successful
    return res.json({
      status: "success",
      message: "Login successful!",
      user: { username: user.username, email: user.email },
    });
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

  // 1️⃣ Validate inputs
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required." });
  }

  try {
    // 2️⃣ Check if user already exists
    const existingUser = await findByUsernameOrEmail(username);
    const existingEmail = await findByUsernameOrEmail(email);
    if (existingUser || existingEmail) {
      return res
        .status(409)
        .json({ status: "fail", message: "Username or email already exists." });
    }

    // 3️⃣ Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 4️⃣ Create new user
    const newUser = await createUser({ username, email, password_hash, role });

    // 5️⃣ Return success message
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



=======
// ---------------- APPOINTMENT ROUTES (MySQL) ----------------
>>>>>>> Stashed changes

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

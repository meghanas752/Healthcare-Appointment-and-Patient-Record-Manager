// src/server/server.js

// --- 1. ALL REQUIRE STATEMENTS ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require("bcryptjs"); // Use the same bcrypt as your teammate

// Import ALL functions from your ONE working database file
const { 
  pool, 
  getPatientHistory, 
  getPatientHistoryByName, 
  createPrescription,
  findUserByEmailOrUsername, // This will come from db.js
  createUser,                // This will come from db.js
  incrementFailedAttempts,   // This will come from db.js
  resetFailedAttempts        // This will come from db.js
} = require('../backend/db.js'); 

// --- 2. DEFINE THE APP (ONLY ONCE) ---
const app = express();
const port = process.env.PORT || 3000;

// --- 3. ALL MIDDLEWARE (app.use) ---
app.use(cors());
app.use(express.json());

// Static File Serving (for your HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '..')));

// --- 4. ALL API ROUTES ---

// ---------------- PATIENT ROUTES (Your code) ----------------
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

// ---------------- PRESCRIPTION ROUTES (Your code) ----------------
app.post('/api/prescriptions', async (req, res) => {
  try {
    const { patientId, details } = req.body;
    if (!patientId || !details) {
      return res.status(400).json({ message: 'patientId and details are required.' });
    }
    const newPrescription = await createPrescription(patientId, details);
    res.status(201).json(newPrescription); 
  } catch (error) {
    console.error('Database error creating prescription:', error);
    res.status(500).json({ message: 'Error creating prescription.' });
  }
});

// ---------------- AUTH ROUTES (Now using your working db.js) ----------------
app.post("/api/auth/login", async (req, res) => {
  console.log("🔹 Received POST /api/auth/login");
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ status: "error", message: "Username/email and password are required." });
  }

  try {
    // Use the NEW, WORKING function from db.js
    const user = await findUserByEmailOrUsername(identifier); 
    if (!user) {
      return res.status(401).json({ status: "fail", message: "Invalid username or password." });
    }
    
    // --- THIS IS YOUR NEW LOCKOUT LOGIC ---
    if (user.failed_attempts >= 5) {
      if (user.last_failed_at) {
        const now = new Date();
        const lastFailed = new Date(user.last_failed_at);
        const secondsSinceLastFail = (now.getTime() - lastFailed.getTime()) / 1000;

        if (secondsSinceLastFail < 30) {
          return res.status(429).json({ // 429 = Too Many Requests
            status: "fail", 
            message: `Account locked. Please wait ${Math.ceil(30 - secondsSinceLastFail)} seconds.` 
          });
        }
      }
    }
    // --- END LOCKOUT LOGIC ---

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      // --- LOGIN FAILED (Wrong Password) ---
      await incrementFailedAttempts(user.id);
      
      const newCount = user.failed_attempts + 1;
      let message = "Invalid username or password.";

      if (newCount >= 5) {
        message = "Invalid password. Account is now locked for 30 seconds.";
      }
      
      return res.status(401).json({ 
        status: "fail", 
        message: message,
        failedAttempts: newCount 
      });
    }

    // --- LOGIN SUCCESS ---
    await resetFailedAttempts(user.id);

    return res.json({
      status: "success",
      message: "Login successful!",
      user: { 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
    });

  } catch (err) {
    console.error("❌ Error during login:", err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  console.log("🔹 Received POST /api/auth/signup");
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ status: "error", message: "All fields are required." });
  }

  try {
    // Use the NEW, WORKING function from db.js
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await createUser({ username, email, password_hash, role });

    res.status(201).json({
      status: "success",
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Error during signup:", err);
    if (err.code === 'ER_DUP_ENTRY') { // Check for specific SQL error
      return res.status(409).json({ status: "fail", message: "Username or email already exists." });
    }
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// ---------------- APPOINTMENT ROUTES (Your teammate's code) ----------------
// (These will all work now because they use the 'pool' from db.js)
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

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
// --- 5. START THE SERVER (at the end of the file) ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

// --- 6. EXPORT THE APP FOR TESTS ---
module.exports = app;
// src/server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Update this path to be correct relative to server.js
// **THIS IS THE FIX:** Make sure BOTH functions are imported
const { getPatientHistory, getPatientHistoryByName } = require('../backend/db.js'); 
const { findByUsernameOrEmail } = require("C:/Users/megha/OneDrive/Desktop/sem5/software_engineering/project/src/server/models/userModel.js"); // ✅ import here
const bcrypt = require("bcryptjs");
const { createUser } = require("./models/userModel.js"); // ✅ import here

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your frontend (in src/web) to call this backend
app.use(express.json());

// --- YOUR ORIGINAL API ENDPOINT (keep this) ---
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

// --- YOUR NEW SEARCH API ENDPOINT ---
app.get('/api/patients/search', async (req, res) => {
  try {
    const patientName = req.query.name; // Gets name from URL like ?name=David%20Lee

    if (!patientName) {
      return res.status(400).json({ message: 'Patient name query is required.' });
    }

    // **THIS IS THE FIX:** Call the function you imported
    const { patient, history } = await getPatientHistoryByName(patientName);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' }); // 404 for Not Found
    }
    
    // Send back both the patient info and their history
    res.json({ patient, history });

  } catch (error) {
    console.error('Database error during patient search:', error);
    res.status(500).json({ message: 'Error searching for patient.' });
  }
});

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




// --- (Your team's other routes like /api/auth/login go here) ---
// ...

// Start Server (but not when testing)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app; // Export 'app' for our integration tests
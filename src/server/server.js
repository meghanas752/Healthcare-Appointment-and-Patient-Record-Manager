// src/server/server.js

// --- 1. ALL REQUIRE STATEMENTS ---
// This is the CRITICAL fix to read your .env file
require('dotenv').config({ path: __dirname + '/../../.env' }); 

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require("bcryptjs");

// Import ALL functions from the team's official database file
const { 
  pool, 
  getPatientHistory, 
  getPatientHistoryByName, 
  createPrescription,
  findUserByEmailOrUsername,
  createUser,
  incrementFailedAttempts,
  resetFailedAttempts,
  getAppointmentsByDoctorName // <-- THIS LINE IS ADDED
} = require('../backend/db.js'); 

// --- 2. DEFINE THE APP (ONLY ONCE) ---
const app = express();
const port = process.env.PORT || 3000;

// --- 3. ALL MIDDLEWARE (app.use) ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web/public')));

// Static File Serving (for your HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '..'))); // This is their original line
app.use(express.static('src/web/public')); // This serves your friend's pages

// --- 4. ALL API ROUTES ---

// ---------------- TEAMMATE'S PATIENT ROUTES ----------------
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

// ---------------- YOUR PATIENT ROUTES (FROM HMPRS-18 & 30) ----------------
app.post('/api/patients/register', async (req, res) => {
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

app.get('/api/patients/unassigned', async (req, res) => {
    try {
        const sql = 'SELECT id, patient_name AS name FROM appointments WHERE bed_id IS NULL';
        const [patients] = await pool.query(sql);
        res.json(patients);
    } catch (err) {
        console.error('Error fetching unassigned appointments:', err);
        return res.status(500).json({ error: 'Database error occurred.' });
    }
});

// ---------------- YOUR BED ROUTES (FROM HMPRS-30) ----------------
app.get('/api/beds', async (req, res) => {
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
        const [beds] = await pool.query(sql);
        res.json(beds);
    } catch (err) {
        console.error('Error fetching beds:', err);
        return res.status(500).json({ error: 'Database error occurred.' });
    }
});

app.post('/api/beds/assign', async (req, res) => {
    try {
        const { patientId: appointmentId, bedId } = req.body;
        if (!appointmentId || !bedId) {
            return res.status(400).json({ error: 'Appointment ID and Bed ID are required.' });
        }
        const updateAppointmentSql = 'UPDATE appointments SET bed_id = ? WHERE id = ?';
        await pool.query(updateAppointmentSql, [bedId, appointmentId]);
        const updateBedSql = 'UPDATE beds SET is_occupied = TRUE WHERE id = ?';
        await pool.query(updateBedSql, [bedId]);
        res.json({ message: `Successfully assigned appointment ${appointmentId} to bed ${bedId}.` });
    } catch (err) {
        console.error('Error assigning bed:', err);
        return res.status(500).json({ error: 'Failed to assign bed.' });
    }
});

// ---------------- BILLING ROUTE (HMPRS-28) ----------------
// This is the new API endpoint for your billing feature
app.get('/api/billing/:appointmentId', async (req, res) => {
    const { appointmentId } = req.params;

    try {
        // 1. Get consultation fees from the 'appointments' table
        const [consultations] = await pool.query(
            'SELECT "Consultation" AS item, consultation_fee AS cost FROM appointments WHERE id = ?',
            [appointmentId]
        );

        // 2. Get medicine costs from the 'prescriptions' table
        const [medicines] = await pool.query(
            'SELECT details AS item, cost FROM prescriptions WHERE appointment_id = ?',
            [appointmentId]
        );

        // 3. Get treatment costs from the 'treatments' table
        const [treatments] = await pool.query(
            'SELECT details AS item, cost FROM treatments WHERE appointment_id = ?',
            [appointmentId]
        );

        // 4. Get allergy info (cost is 0, but good to list)
         const [allergies] = await pool.query(
            'SELECT details AS item, 0 AS cost FROM allergies WHERE appointment_id = ?',
            [appointmentId]
        );

         // 5. Get diagnosis info (cost is 0, but good to list)
         const [diagnoses] = await pool.query(
            'SELECT details AS item, 0 AS cost FROM diagnoses WHERE appointment_id = ?',
            [appointmentId]
        );

        // Combine all items into one bill
        const itemizedBill = [...consultations, ...medicines, ...treatments, ...allergies, ...diagnoses];

        // Calculate the total cost (only for items that have a cost)
        const total = itemizedBill.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);

        res.json({
            items: itemizedBill,
            total: total.toFixed(2)
        });

    } catch (err) {
        console.error('Error generating bill:', err);
        return res.status(500).json({ error: 'Database error occurred.' });
    }
});

// ---------------- PRESCRIPTION ROUTES ----------------
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

// ---------------- AUTH ROUTES ----------------
app.post("/api/auth/login", async (req, res) => {
  console.log("🔹 Received POST /api/auth/login");
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ status: "error", message: "Username/email and password are required." });
  }

  try {
    const user = await findUserByEmailOrUsername(identifier); 
    if (!user) {
      return res.status(401).json({ status: "fail", message: "Invalid username or password." });
    }
    
    if (user.failed_attempts >= 5) {
      if (user.last_failed_at) {
        const now = new Date();
        const lastFailed = new Date(user.last_failed_at);
        const secondsSinceLastFail = (now.getTime() - lastFailed.getTime()) / 1000;

        if (secondsSinceLastFail < 30) {
          return res.status(429).json({ 
            status: "fail", 
            message: `Account locked. Please wait ${Math.ceil(30 - secondsSinceLastFail)} seconds.` 
          });
        }
      }
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
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
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await createUser({ username, email, password_hash, role });

    res.status(201).json({
      status: "success",
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (err) {
    console.error("❌ Error during signup:", err);
    if (err.code === 'ER_DUP_ENTRY') { 
      return res.status(409).json({ status: "fail", message: "Username or email already exists." });
    }
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// ---------------- APPOINTMENT ROUTES ----------------
// ✅ Get all appointments (for staff)
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// ***** THIS IS YOUR NEW ROUTE *****
// ✅ Get appointments for a specific doctor (for your feature)
app.get('/api/appointments/doctor/:name', async (req, res) => {
  try {
    const doctorName = req.params.name;
    const appointments = await getAppointmentsByDoctorName(doctorName);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// ✅ Add a new appointment
// ✅ Add a new appointment (with email + contact)
app.post('/api/appointments', async (req, res) => {
  try {
    const { 
      patient_name, 
      patient_email,        // ⭐ ADDED
      patient_contact,      // ⭐ ADDED
      doctor_name, 
      appointment_date, 
      appointment_time 
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO appointments 
      (patient_name, patient_email, patient_contact, doctor_name, appointment_date, appointment_time, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_name, patient_email, patient_contact, doctor_name, appointment_date, appointment_time, 'Booked']
    );

    const newAppointment = {
      id: result.insertId,
      patient_name,
      patient_email,       // ⭐ ADDED
      patient_contact,     // ⭐ ADDED
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




//pharmacy inventory
app.get("/pharmacy/inventory", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inventory_items");
    res.json(rows);
  } catch (err) {
    console.error("Error loading inventory:", err);
    res.status(500).json({ message: "Error loading inventory" });
  }
});

app.post("/pharmacy/restock", async (req, res) => {
  try {
    const { drug_code, qty } = req.body;
    if (!drug_code || !qty || qty <= 0) {
      return res.status(400).send("drug_code and positive qty are required");
    }
   // 1) ensure the item exists
    await pool.query(
      "INSERT IGNORE INTO inventory_items (drug_code, drug_name, stock, updated_at) VALUES (?, ?, 0, NOW())",
      [drug_code, drug_code] // use code as name if you don't have one
    );

    // 2) add stock
    const [upd] = await pool.query(
      "UPDATE inventory_items SET stock = stock + ?, updated_at = NOW() WHERE drug_code = ?",
      [qty, drug_code]
    );

    if (upd.affectedRows === 0) {
      return res.status(404).send("Drug code not found");
    }

     // 3) log movement (reason/type consistent)
    await pool.query(
      "INSERT INTO inventory_moves (drug_code, qty, reason, ref_type, type, reference_id) VALUES (?, ?, 'RESTOCK', 'MANUAL', 'RESTOCK', NULL)",
      [drug_code, qty]
    );

    res.send("Restock successful!");
  } catch (err) {
    console.error("Error restocking:", err);
    res.status(500).send("Error restocking medicine");
  }
});
app.post("/pharmacy/dispense", async (req, res) => {
  try {
    const { drug_code, qty, ref_id } = req.body;
    if (!drug_code || !qty || qty <= 0) {
      return res.status(400).send("drug_code and positive qty are required");
    }

    // 1) check current stock
    const [[item]] = await pool.query(
      "SELECT stock FROM inventory_items WHERE drug_code = ?",
      [drug_code]
    );
    if (!item) return res.status(404).send("Drug code not found");
    if (item.stock < qty) return res.status(400).send("Insufficient stock");

    // 2) reduce stock
    await pool.query(
      "UPDATE inventory_items SET stock = stock - ?, updated_at = NOW() WHERE drug_code = ?",
      [qty, drug_code]
    );

    // 3) log movement; ref_type derived from presence of ref_id
    const refType = ref_id ? "PRESCRIPTION" : "MANUAL";
    await pool.query(
      "INSERT INTO inventory_moves (drug_code, qty, reason, ref_type, type, reference_id) VALUES (?, ?, 'DISPENSE', ?, 'DISPENSE', ?)",
      [drug_code, qty, refType, ref_id || null]
    );

      res.send("Medicine dispensed!");
  } catch (err) {
    console.error("Error dispensing:", err);
    res.status(500).send("Error dispensing medicine");
  }
});




// ** NOTE: I have removed the duplicated APPOINTMENT ROUTES block from the end of your file. **
// ---------------------------------------------------------


// --- 5. START THE SERVER (at the end of the file) ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

// --- 6. EXPORT THE APP FOR TESTS ---
module.exports = app;
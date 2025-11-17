// src/server/server.js

// --- 1. ALL REQUIRE STATEMENTS ---
require('dotenv').config({ path: __dirname + '/../../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require("bcryptjs");

// Import ALL functions from db.js
const {
  pool,
  getPatientHistory,
  getPatientHistoryByName,
  createPrescription,
  findUserByEmailOrUsername,
  createUser,
  incrementFailedAttempts,
  resetFailedAttempts,
  getAppointmentsByDoctorName,
  getAppointmentDetails,
  createTreatment
} = require('../backend/db.js');

// --- 2. DEFINE THE APP ---
const app = express();
const port = process.env.PORT || 3000;

// --- 3. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web/public')));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static('src/web/public'));

// --- 4. ALL API ROUTES ---

// ==================== PATIENT ROUTES ====================
app.get('/api/patients/:id/history', async (req, res) => {
  try {
    const history = await getPatientHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Database error fetching patient history:', error);
    res.status(500).json({ message: 'Error fetching patient data.' });
  }
});

app.get('/api/patients/search', async (req, res) => {
  try {
    const { patient, history } = await getPatientHistoryByName(req.query.name);
    if (!patient) return res.status(404).json({ message: 'Patient not found.' });
    res.json({ patient, history });
  } catch (error) {
    console.error('Database error during patient search:', error);
    res.status(500).json({ message: 'Error searching for patient.' });
  }
});

app.post('/api/patients/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, medicalHistory, currentMedications } = req.body;
    if (!firstName || !lastName)
      return res.status(400).json({ error: 'First name and last name are required.' });

    const newPatient = {
      name: `${firstName} ${lastName}`,
      phone_number: phone,
      medical_history: medicalHistory,
      current_medications: currentMedications
    };

    const [result] = await pool.query('INSERT INTO patients SET ?', newPatient);

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
    const [patients] = await pool.query(
      'SELECT id, patient_name AS name FROM appointments WHERE bed_id IS NULL'
    );
    res.json(patients);
  } catch (err) {
    console.error('Error fetching unassigned appointments:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

// ==================== BED ROUTES ====================
app.get('/api/beds', async (req, res) => {
  try {
    const [beds] = await pool.query(`
      SELECT beds.id, beds.bed_number, beds.is_occupied, wards.name AS ward_name
      FROM beds JOIN wards ON beds.ward_id = wards.id
      ORDER BY wards.name, beds.bed_number;
    `);
    res.json(beds);
  } catch (err) {
    console.error('Error fetching beds:', err);
    return res.status(500).json({ error: 'Database error occurred.' });
  }
});

app.post('/api/beds/assign', async (req, res) => {
  try {
    const { patientId, bedId } = req.body;
    if (!patientId || !bedId)
      return res.status(400).json({ error: 'Appointment ID and Bed ID are required.' });

    await pool.query('UPDATE appointments SET bed_id = ? WHERE id = ?', [bedId, patientId]);
    await pool.query('UPDATE beds SET is_occupied = TRUE WHERE id = ?', [bedId]);

    res.json({ message: `Successfully assigned appointment ${patientId} to bed ${bedId}.` });
  } catch (err) {
    console.error('Error assigning bed:', err);
    return res.status(500).json({ error: 'Failed to assign bed.' });
  }
});

// ==================== REMOVE OLD HMPRS-28 BILLING ====================
// ❌ (Appointment-based billing removed completely as per Option C)

// ==================== PRESCRIPTIONS ====================
app.post('/api/prescriptions', async (req, res) => {
  try {
    const { appointmentId, details, cost } = req.body;

    if (!appointmentId || !details)
      return res.status(400).json({ message: 'Appointment ID and details are required.' });

    const newPrescription = await createPrescription(
      appointmentId,
      details,
      cost || 10.0
    );

    res.status(201).json(newPrescription);
  } catch (error) {
    console.error('Database error creating prescription:', error);
    res.status(500).json({ message: 'Error creating prescription.' });
  }
});

// ==================== TREATMENTS ====================
app.post('/api/treatments', async (req, res) => {
  try {
    const { appointmentId, details, cost } = req.body;

    if (!appointmentId || !details)
      return res.status(400).json({ message: 'Appointment ID and details are required.' });

    const newTreatment = await createTreatment(
      appointmentId,
      details,
      cost || 0.0
    );

    res.status(201).json(newTreatment);
  } catch (error) {
    console.error('Database error creating treatment:', error);
    res.status(500).json({ message: 'Error creating treatment.' });
  }
});

// ==================== AUTH ====================
app.post("/api/auth/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password)
    return res.status(400).json({ status: "error", message: "Username/email and password are required." });

  try {
    const user = await findUserByEmailOrUsername(identifier);
    if (!user)
      return res.status(401).json({ status: "fail", message: "Invalid username or password." });

    if (user.failed_attempts >= 5 && user.last_failed_at) {
      const secondsSinceLastFail = (Date.now() - new Date(user.last_failed_at)) / 1000;
      if (secondsSinceLastFail < 30) {
        return res.status(429).json({
          status: "fail",
          message: `Account locked. Please wait ${Math.ceil(30 - secondsSinceLastFail)} seconds.`
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await incrementFailedAttempts(user.id);

      const failed = user.failed_attempts + 1;
      return res.status(401).json({
        status: "fail",
        message: failed >= 5
          ? "Invalid password. Account is now locked for 30 seconds."
          : "Invalid username or password.",
        failedAttempts: failed
      });
    }

    await resetFailedAttempts(user.id);

    res.json({
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
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role)
    return res.status(400).json({ status: "error", message: "All fields are required." });

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
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ status: "fail", message: "Username or email already exists." });

    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// ==================== APPOINTMENTS ====================
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

app.get('/api/appointments/doctor/:name', async (req, res) => {
  try {
    const appointments = await getAppointmentsByDoctorName(req.params.name);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

app.get('/api/appointments/:id/details', async (req, res) => {
  try {
    const details = await getAppointmentDetails(req.params.id);
    res.json(details);
  } catch (error) {
    if (error.message === 'Appointment not found.')
      return res.status(404).json({ message: error.message });

    res.status(500).json({ message: 'Error fetching details' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const {
      patient_name,
      patient_email,
      patient_contact,
      doctor_name,
      appointment_date,
      appointment_time
    } = req.body;

    if (!patient_name || !doctor_name || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments 
       (patient_name, patient_email, patient_contact, doctor_name, appointment_date, appointment_time, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patient_name, patient_email, patient_contact, doctor_name,
       appointment_date, appointment_time, 'Booked']
    );

    res.status(201).json({
      id: result.insertId,
      patient_name,
      patient_email,
      patient_contact,
      doctor_name,
      appointment_date,
      appointment_time,
      status: 'Booked'
    });

  } catch (error) {
    console.error('Error inserting appointment:', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ message: `Appointment ${req.params.id} deleted` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});

// ==================== PHARMACY ====================

// ---- GET INVENTORY ----
app.get("/pharmacy/inventory", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM inventory_items");
    res.json(rows);
  } catch (err) {
    console.error("Error loading inventory:", err);
    res.status(500).json({ message: "Error loading inventory" });
  }
});

// ---- RESTOCK ----
app.post("/pharmacy/restock", async (req, res) => {
  try {
    const { drug_code, qty, price } = req.body;

    if (!drug_code || !qty || qty <= 0 || price === undefined || price < 0) {
      return res.status(400).send("drug_code, qty and price are required");
    }

    // 1) Ensure item exists
    await pool.query(
      `INSERT INTO inventory_items (drug_code, drug_name, stock, price, updated_at)
       VALUES (?, ?, 0, ?, NOW())
       ON DUPLICATE KEY UPDATE price = VALUES(price)`,
      [drug_code, drug_code, price]
    );

    // 2) Add stock
    await pool.query(
      `UPDATE inventory_items 
       SET stock = stock + ?, updated_at = NOW() 
       WHERE drug_code = ?`,
      [qty, drug_code]
    );

    // 3) Log movement
    await pool.query(
      `INSERT INTO inventory_moves (drug_code, qty, reason, ref_type, type, reference_id, unit_price) 
       VALUES (?, ?, 'RESTOCK', 'MANUAL', 'RESTOCK', NULL, ?)`,
      [drug_code, qty, price]
    );

    res.send("Restock successful!");
  } catch (err) {
    console.error("Error restocking:", err);
    res.status(500).send("Error restocking medicine");
  }
});


// ---- DISPENSE ----
app.post("/pharmacy/dispense", async (req, res) => {
  try {
    const { drug_code, qty, ref_id } = req.body;

    if (!drug_code || !qty || qty <= 0)
      return res.status(400).send("drug_code and positive qty are required");

    const [[item]] = await pool.query(
      "SELECT stock FROM inventory_items WHERE drug_code = ?",
      [drug_code]
    );
    if (!item) return res.status(404).send("Drug code not found");
    if (item.stock < qty) return res.status(400).send("Insufficient stock");

    // reduce stock
    await pool.query(
      "UPDATE inventory_items SET stock = stock - ?, updated_at = NOW() WHERE drug_code = ?",
      [qty, drug_code]
    );

    // record dispensing with prescription/ref_id
    await pool.query(
      "INSERT INTO inventory_moves (drug_code, qty, reason, ref_type, type, reference_id) VALUES (?, ?, 'DISPENSE', 'PRESCRIPTION', 'DISPENSE', ?)",
      [drug_code, qty, ref_id]
    );

    res.send("Medicine dispensed!");
  } catch (err) {
    console.error("Error dispensing:", err);
    res.status(500).send("Error dispensing medicine");
  }
});

// ---- FINAL BILLING by PRESCRIPTION ID ----
app.get("/pharmacy/final-bill/:refId", async (req, res) => {
  try {
    const refId = req.params.refId;

    // get all medicines for this prescription
    const [rows] = await pool.query(
      `SELECT 
         drug_code,
         qty,
         (SELECT price FROM inventory_items WHERE inventory_items.drug_code = inventory_moves.drug_code) AS unit_price,
         qty * (SELECT price FROM inventory_items WHERE inventory_items.drug_code = inventory_moves.drug_code) AS total
       FROM inventory_moves
       WHERE reference_id = ? AND reason = 'DISPENSE'`,
      [refId]
    );

    const total = rows.reduce((s, r) => s + (r.total || 0), 0);

    res.json({
      items: rows,
      total
    });

  } catch (err) {
    console.error("Error generating bill:", err);
    res.status(500).send("Error generating bill");
  }
});

// ==================== START SERVER ====================
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

module.exports = app;
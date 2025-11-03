// src/server/server.js
require('dotenv').config();

/////////////////////////
// Global crash handlers
/////////////////////////
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION at promise:', promise, '\nreason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
});

process.on('exit', (code) => {
  console.log(`🧩 Process exiting normally with code ${code}`);
});
process.on('beforeExit', () => {
  console.log('🧩 beforeExit triggered — event loop empty.');
});


/////////////////////////
// Module loading logs
/////////////////////////
console.log('🔹 server.js starting...');

try {
  const express = require('express');
  const cors = require('cors');
  console.log('✅ express & cors modules loaded.');
  
  // create app early so we can add middleware even if DB fails
  var app = express();
  app.use(cors());
  app.use(express.json());


  console.log('✅ express app created.');
} catch (err) {
  console.error('❌ Failed to require express/cors or create app:', err);
  // rethrow because we cannot run without Express
  throw err;
}

const port = process.env.PORT || 3000;

/////////////////////////
// Defensive DB import
/////////////////////////
let getPatientHistory = async (id) => {
  console.warn('⚠️  getPatientHistory called but DB is not loaded — returning empty array.');
  return [];
};
let getPatientHistoryByName = async (name) => {
  console.warn('⚠️  getPatientHistoryByName called but DB is not loaded — returning null.');
  return { patient: null, history: [] };
};

console.log('🔹 Attempting to load DB module at ../backend/db.js ...');
try {
  // wrap require in try/catch because require may throw synchronously
  const db = require('../backend/db.js');

  // Defensive checks: ensure the functions exist and are functions
  if (db && typeof db.getPatientHistory === 'function' && typeof db.getPatientHistoryByName === 'function') {
    getPatientHistory = db.getPatientHistory;
    getPatientHistoryByName = db.getPatientHistoryByName;
    console.log('✅ DB module loaded and functions assigned.');
  } else {
    console.error('❌ DB module loaded but expected functions are missing or not functions. DB module export:', db);
  }
} catch (err) {
  // Log full stack + message — this is probably where your process is failing
  console.error('❌ Error while requiring ../backend/db.js — this likely caused the process to exit before listen():', err && err.stack ? err.stack : err);
  console.error('👉 Possible causes: synchronous throw in db.js, top-level await (unsupported), pool.connect() throwing, or process.exit() in db.js.');
  // do NOT rethrow — we keep server up with fallback stubs so we can debug
}

/////////////////////////
// Middleware
/////////////////////////
// app.use(cors());

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url} — query: ${JSON.stringify(req.query)} body: ${JSON.stringify(req.body)}`);
  next();
});

/////////////////////////
// Routes
/////////////////////////
app.get('/api/patients/:id/history', async (req, res) => {
  console.log('🔹 GET /api/patients/:id/history handler entered');
  try {
    const patientId = req.params.id;
    console.log('  -> patientId:', patientId);
    const history = await getPatientHistory(patientId);
    console.log('  -> history retrieved, length:', Array.isArray(history) ? history.length : typeof history);
    res.json(history || []);
  } catch (error) {
    console.error('❌ Database error fetching patient history:', error && error.stack ? error.stack : error);
    res.status(500).json({ message: 'Error fetching patient data.' });
  }
});

app.get('/api/patients/search', async (req, res) => {
  console.log('🔹 GET /api/patients/search handler entered');
  try {
    const patientName = req.query.name;
    console.log('  -> query.name:', patientName);

    if (!patientName) {
      console.warn('  -> missing name query param');
      return res.status(400).json({ message: 'Patient name query is required.' });
    }

    const result = await getPatientHistoryByName(patientName);
    console.log('  -> getPatientHistoryByName returned:', result && typeof result === 'object' ? Object.keys(result) : typeof result);

    // support both shapes: { patient, history } or null
    const patient = result && result.patient ? result.patient : null;
    const history = result && result.history ? result.history : [];

    if (!patient) {
      console.warn('  -> patient not found for name:', patientName);
      return res.status(404).json({ message: 'Patient not found.' });
    }

    res.json({ patient, history });
  } catch (error) {
    console.error('❌ Database error during patient search:', error && error.stack ? error.stack : error);
    res.status(500).json({ message: 'Error searching for patient.' });
  }
});

/////////////////////////
// Generic error handler middleware
/////////////////////////
app.use((err, req, res, next) => {
  console.error('🔥 Express error handler caught an error:', err && err.stack ? err.stack : err);
  res.status(500).json({ message: 'Internal server error' });
});

/////////////////////////
// Start server
/////////////////////////
try {
  if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(port, () => {
      console.log(`✅ Server listening at http://localhost:${port}`);
    });

    // log when server closes
    server.on('close', () => {
      console.warn('⚠️  HTTP server closed.');
    });
  } else {
    console.log('ℹ️  NODE_ENV is "test" — server NOT started (exports app for tests).');
  }
} catch (err) {
  console.error('❌ Failed to start server (listen threw):', err && err.stack ? err.stack : err);
}

module.exports = app;

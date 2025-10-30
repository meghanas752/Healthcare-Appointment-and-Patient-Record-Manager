// server.js

// 1. Import necessary packages and files
const express = require('express');
const patientRoutes = require('./routes/patients');
const db = require('./db-config');

// 2. Create the Express application
const app = express();
const PORT = 3000;

// 3. Add Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- THIS IS THE NEW LINE YOU NEED TO ADD ----
// This tells Express to serve all the files from the 'public' folder
app.use(express.static('public'));

// 4. Define the API Routes
app.use('/api/patients', patientRoutes);

// 5. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});
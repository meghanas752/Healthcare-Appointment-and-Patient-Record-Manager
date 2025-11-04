// server.js

// 1. Import necessary packages and files
const express = require('express');
const patientRoutes = require('./routes/patients');
const bedRoutes = require('./routes/beds'); // Kept this line
const db = require('./db-config');         // Kept this line

// 2. Create the Express application
const app = express();
const PORT = 3000;

// 3. Add Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Kept the functional code

// 4. Define the API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/beds', bedRoutes); // Kept this line

// 5. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});
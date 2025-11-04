// db-config.js

// This line loads the environment variables from your .env file
require('dotenv').config();

const mysql = require('mysql');

// This creates the connection object using your secure password
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD, // Reads the password from .env
    database: 'hospital_db'
});

// This establishes the actual connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database as id ' + connection.threadId);
});

// This exports the connection so other files can use it
module.exports = connection;
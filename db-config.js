// db-config.js

// 1. Load the environment variables from your .env file
require('dotenv').config();

const mysql = require('mysql');

// 2. Create the connection object
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // 3. Use the password from the .env file
    // process.env.DB_PASSWORD will be replaced with your actual password
    password: process.env.DB_PASSWORD, 
    database: 'hospital_db'
});

// Establish the connection
connection.connect((err) => {
  if (err) {
    // If the password in your .env file is wrong, you will see an error here!
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database as id ' + connection.threadId);
});

// Export the connection so other files can use it
module.exports = connection;
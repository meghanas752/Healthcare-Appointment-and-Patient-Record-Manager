// src/server/utils/db.js
// Simple mysql2 connection pool used by auth model.
// Uses env variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_db',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;

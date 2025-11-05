// src/server/models/userModel.js
//const pool = require('../utils/db');
const { pool } = require('../../backend/db.js');

async function createUser({ username, email, password_hash, role = 'patient' }) {
  const sql = `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`;
  const [res] = await pool.execute(sql, [username, email, password_hash, role]);
  return { id: res.insertId, username, email, role };
}

async function findByUsernameOrEmail(identifier) {
  const sql = `SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [identifier, identifier]);
  return rows[0];
}

async function findById(id) {
  const sql = `SELECT id, username, email, role, failed_attempts, lockout_until, created_at FROM users WHERE id = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
}

async function incrementFailedAttempts(userId) {
  await pool.execute(`UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?`, [userId]);
  const [rows] = await pool.execute(`SELECT failed_attempts FROM users WHERE id = ?`, [userId]);
  return rows[0] ? rows[0].failed_attempts : 0;
}

async function resetFailedAttempts(userId) {
  await pool.execute(`UPDATE users SET failed_attempts = 0, lockout_until = NULL WHERE id = ?`, [userId]);
}

async function lockAccount(userId, unlockAtDate) {
  await pool.execute(`UPDATE users SET lockout_until = ?, failed_attempts = 0 WHERE id = ?`, [unlockAtDate, userId]);
}

module.exports = {
  createUser,
  findByUsernameOrEmail,
  incrementFailedAttempts,
  resetFailedAttempts,
  lockAccount
};

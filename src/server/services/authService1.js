// src/server/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const MAX_FAILED = Number(process.env.MAX_FAILED_ATTEMPTS || 5);
const LOCK_SECONDS = Number(process.env.LOCK_DURATION_SECONDS || 300); // 5 min default

async function register({ username, email, password, role }) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await userModel.createUser({ username, email, password_hash: hash, role });
  return user;
}

async function authenticate(identifier, password) {
  const user = await userModel.findByUsernameOrEmail(identifier);
  if (!user) return { ok: false, msg: 'Invalid credentials' };

  // check lock
  if (user.locked_until) {
    const lockedUntil = new Date(user.locked_until);
    if (lockedUntil > new Date()) {
      const diffSeconds = Math.ceil((lockedUntil - new Date())/1000);
      return { ok: false, msg: `Account locked. Try again in ${diffSeconds} seconds.` };
    } else {
      // lock expired, reset counters
      await userModel.resetFailedAttempts(user.id);
    }
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const failed = await userModel.incrementFailedAttempts(user.id);
    if (failed >= MAX_FAILED) {
      const unlockAt = new Date(Date.now() + LOCK_SECONDS * 1000);
      await userModel.lockAccount(user.id, unlockAt);
      return { ok: false, msg: `Account locked due to too many failed logins. Try again after ${LOCK_SECONDS} seconds.` };
    }
    return { ok: false, msg: 'Invalid credentials' };
  }

  // success: reset counters
  await userModel.resetFailedAttempts(user.id);

  // create token
  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return { ok: true, token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { register, authenticate, verifyToken };

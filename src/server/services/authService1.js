// src/server/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const { isLocked, MAX_ATTEMPTS, LOCK_MINUTES } = require('./lockout');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const MAX_FAILED = Number(process.env.MAX_FAILED_ATTEMPTS || 5);
const LOCK_SECONDS = Number(process.env.LOCK_DURATION_SECONDS || 300); // 5 min default


async function register({ username, email, password, role }) {
  const hash = await bcrypt.hash(password, 10);
  return await userModel.createUser({ username, email, password_hash: hash, role });
}

async function authenticate(identifier, password) {
  const user = await userModel.findByUsernameOrEmail(identifier);
  if (!user) return { ok: false, msg: 'Invalid username or password.' };

  // check lock
  const lock = isLocked(user);
  if (lock.locked) {
    return {
      ok: false,
      code: 'LOCKED',
      msg: `Account locked. Try again at ${new Date(lock.unlockAt).toLocaleTimeString()}`
    };
  }

const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const failed = await userModel.incrementFailedAttempts(user.id);

    if (failed >= MAX_ATTEMPTS) {
      const unlockAt = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      await userModel.lockAccount(user.id, unlockAt);
      return {
        ok: false,
        code: 'LOCKED',
        msg: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`
      };
    }

    return {
      ok: false,
      code: 'BAD_CREDENTIALS',
      msg: `Invalid credentials. ${MAX_ATTEMPTS - failed} attempts left.`
    };
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

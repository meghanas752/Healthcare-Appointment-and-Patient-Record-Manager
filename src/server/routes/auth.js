// src/server/routes/auth.js
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await authService.register({ username, email, password, role });
    return res.status(201).json({ ok: true, msg: 'Signup successful!', user });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.authenticate(identifier, password);
    const status = result.ok ? 200 : result.code === 'LOCKED' ? 423 : 401;
    return res.status(status).json(result);
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

module.exports = router;

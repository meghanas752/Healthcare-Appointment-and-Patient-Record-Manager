// src/server/routes/auth.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authService = require('../services/authService');
const userModel = require('../models/userModel');

// POST /api/auth/register
router.post('/register',
  [
    body('username').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['patient','doctor','staff','admin'])
  ],
  async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      // basic existence check
      const existing = await userModel.findByUsernameOrEmail(username) || await userModel.findByUsernameOrEmail(email);
      if (existing) return res.status(400).json({ ok: false, msg: 'Username or email already exists' });
      const user = await authService.register({ username, email, password, role });
      return res.status(201).json({ ok: true, user });
    } catch (err) {
      console.error('register error', err);
      return res.status(500).json({ ok: false, msg: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post('/login',
  [
    body('identifier').notEmpty(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const { identifier, password } = req.body;
      const result = await authService.authenticate(identifier, password);
      if (!result.ok) return res.status(400).json(result);
      return res.json(result);
    } catch (err) {
      console.error('login error', err);
      return res.status(500).json({ ok: false, msg: 'Server error' });
    }
  }
);

const authMiddleware = require('../middleware/authMiddleware');

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ ok: false, msg: 'User not found' });
    return res.json({ ok: true, user });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

module.exports = router;

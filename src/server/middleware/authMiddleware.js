// src/server/middleware/authMiddleware.js
const authService = require('../services/authService');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, msg: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);
  if (!payload) return res.status(401).json({ ok: false, msg: 'Invalid token' });
  req.user = payload;
  next();
};

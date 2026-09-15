const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../config/database');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    const user = db.prepare('SELECT id, name, email, role, phone, address, city, avatar_url, is_active FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (user.is_active !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact platform administration.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed.',
      error: error.message
    });
  }
}

module.exports = authMiddleware;

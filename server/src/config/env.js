require('dotenv').config();
const path = require('node:path');

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'agrishop_marketplace_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOAD_DIR: path.join(__dirname, '../../uploads'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};

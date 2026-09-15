const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILE = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(DB_DIR, 'agrishop.db');

const db = new DatabaseSync(DB_FILE);

// Enable foreign keys & WAL mode for durability and ACID compliance
db.exec('PRAGMA foreign_keys = ON;');
if (DB_FILE !== ':memory:') {
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch (err) {
    console.warn('Could not enable WAL mode:', err.message);
  }
}

/**
 * Helper to run statements safely with parameter mapping.
 * SQLite in Node built-in supports:
 * stmt.all(...params), stmt.get(...params), stmt.run(...params)
 */
module.exports = db;

const fs = require('node:fs');
const path = require('node:path');
const db = require('../config/database');

function setupDatabase() {
  console.log('Initializing AGRISHOP database schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  db.exec(schemaSql);
  console.log('Database tables and indexes created successfully!');
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;

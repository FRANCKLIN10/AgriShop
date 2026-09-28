const app = require('./app');
const env = require('./config/env');
const setupDatabase = require('./database/setup');

// Ensure database tables exist before listening
setupDatabase();

const server = app.listen(env.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌿 AGRISHOP Backend API Server running on port ${env.PORT}`);
  console.log(`🌍 Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`🌾 Platform: AGRISHOP Marketplace`);
  console.log(`=======================================================`);
});

module.exports = server;

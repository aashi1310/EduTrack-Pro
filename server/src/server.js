const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log('----------------------------------------------------');
  console.log('  Starting EduTrack Pro Academic Management API...   ');
  console.log('----------------------------------------------------');

  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️ WARNING: Database connection failed. Please ensure MySQL is running on 127.0.0.1:3306.');
  }

  const server = app.listen(PORT, () => {
    console.log(`✓ EduTrack Pro Backend listening on http://localhost:${PORT}`);
    console.log(`✓ Health endpoint active at http://localhost:${PORT}/api/health`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

module.exports = { bootstrap };

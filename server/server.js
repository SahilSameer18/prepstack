require('dotenv').config()

// Fail fast on missing JWT secrets instead of erroring later on first jwt.sign/verify call
if (!process.env.ACCESS_SECRET || !process.env.REFRESH_SECRET) {
  console.error('❌ Missing ACCESS_SECRET and/or REFRESH_SECRET in environment. Server cannot start.');
  process.exit(1);
}
if (process.env.ACCESS_SECRET.length < 32 || process.env.REFRESH_SECRET.length < 32) {
  console.warn('⚠️  ACCESS_SECRET/REFRESH_SECRET is shorter than the recommended 32 chars.');
}

const mongoose = require('mongoose');
const dns = require('dns');
const app = require('./src/app');
const connectToDB = require('./src/config/database')

// Force public DNS (works around ISPs that cannot resolve mongodb+srv SRV records).
// Opt-in only, so a production host can never pick it up by accident.
if (process.env.ENABLE_CUSTOM_DNS === 'true') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

const PORT = process.env.PORT || 3000;

let server;
let shuttingDown = false;

// Stop accepting requests, let in-flight ones finish, close the DB connection, then exit.
const shutdown = (reason, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${reason}: shutting down...`);

  // Hard stop if something refuses to close
  setTimeout(() => {
    console.error('Shutdown took longer than 10s, forcing exit.');
    process.exit(1);
  }, 10000).unref();

  if (!server) return process.exit(exitCode);

  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch (err) {
      console.error('Error closing MongoDB connection:', err.message);
    }
    process.exit(exitCode);
  });
  server.closeIdleConnections(); // keep-alive sockets would otherwise hold close() open
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
  shutdown('Unhandled rejection', 1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  shutdown('Uncaught exception', 1);
});

const start = async () => {
  // Only start listening once the database is reachable (connectToDB exits the process if it is not)
  await connectToDB();
  server = app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`)
  });
};

start();

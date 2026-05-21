require('dotenv').config();
require('./src/config/env');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { startReminderJob } = require('./src/jobs/reminderJob');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    startReminderJob();
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received. Closing HTTP server.`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    shutdown('unhandledRejection');
  });
});

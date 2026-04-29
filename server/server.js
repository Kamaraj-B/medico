const app = require('./app.js');
const PORT = process.env.PORT || 3000;
const connectDB = require('./config/db.config.js');
const logger = require('./config/logger.js')[0];
const mongoose = require("mongoose");

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1); 
  }
};

// Start the server
startServer();

const shutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown.`);
  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed.");
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

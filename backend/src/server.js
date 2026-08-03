require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log("---------------------------------------");
  console.log(`Portfolio CMS API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("---------------------------------------");
});

// Graceful shutdown
const shutdownServer = (signal) => {
  console.log(`\n${signal} received. Closing the server...`);

  server.close(() => {
    console.log("Server closed successfully.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdownServer("SIGINT"));
process.on("SIGTERM", () => shutdownServer("SIGTERM"));

// Handle rejected promises
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);

  server.close(() => {
    process.exit(1);
  });
});
#!/usr/bin/env node

import app from "./protocols/mcp/app.js";

// Handle graceful shutdown
const shutdown = async () => {
  console.log("\nShutting down gracefully...");
  try {
    await app.stop();
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start server
app.start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

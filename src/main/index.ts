#!/usr/bin/env node

// Suppress fs.Stats constructor deprecation warning from fs-extra dependency
// This is a known issue with fs-extra using deprecated Node.js APIs internally
// The warning (DEP0180) comes from fs-extra's internal usage, not our code
// See: https://github.com/jprichardson/node-fs-extra/issues/1049
const originalEmitWarning = process.emitWarning;
process.emitWarning = function (warning: any, ...args: any[]) {
  if (
    typeof warning === "string" &&
    warning.includes("fs.Stats constructor is deprecated")
  ) {
    return;
  }
  // Handle warning objects
  if (
    typeof warning === "object" &&
    warning?.message?.includes("fs.Stats constructor is deprecated")
  ) {
    return;
  }
  return originalEmitWarning.call(process, warning, ...args);
};

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

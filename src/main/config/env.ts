export const env = {
  rootPath: process.env.CONTEXT_BANK_ROOT || process.env.MEMORY_BANK_ROOT!,
  serverPort: parseInt(process.env.SERVER_PORT || "8080", 10),
  sseEndpoint: process.env.SSE_ENDPOINT || "/mcp",
};

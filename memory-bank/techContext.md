# Technical Context

## Technologies Used

### Core Stack
- **TypeScript**: Primary language (v5.8.2)
- **Node.js**: Runtime environment
- **MCP SDK**: `@modelcontextprotocol/sdk` (v1.5.0) for protocol implementation
- **fs-extra**: File system operations (v11.2.0)

### Development Tools
- **Vitest**: Testing framework (v3.0.8)
- **ts-node**: TypeScript execution for development
- **shx**: Shell commands for build scripts
- **TypeScript Compiler**: Build tool

## Development Setup

### Prerequisites
- Node.js (v20+)
- npm

### Installation
```bash
npm install
```

### Build
```bash
npm run build
```

### Development
```bash
npm run dev  # Runs with ts-node
```

### Testing
```bash
npm run test           # Run tests once
npm run test:watch     # Watch mode
npm run test:ui        # UI mode
npm run test:coverage  # With coverage
```

## Technical Constraints

1. **MCP Protocol**: Must comply with MCP specification
2. **Transport**: HTTP/SSE for multi-client support (replaces stdio)
3. **File System**: Operations limited to `MEMORY_BANK_ROOT` directory
4. **Project Isolation**: Projects must be isolated in separate directories
5. **Path Security**: No path traversal allowed outside project boundaries
6. **Type Safety**: Full TypeScript type coverage required
7. **Concurrent Connections**: Supports multiple team members connecting simultaneously

## Dependencies

### Production
- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `fs-extra`: Enhanced file system operations

### Development
- TypeScript and type definitions
- Vitest for testing
- Coverage tools

## Tool Usage Patterns

### MCP Server
- Entry point: `src/main/index.ts`
- MCP app: `src/main/protocols/mcp/app.ts`
- Tools registered via MCP SDK
- **Transport**: HTTP/SSE (Server-Sent Events) for multi-client support
- **Server**: HTTP server on configurable port (default: 3000)
- **Endpoint**: Configurable SSE endpoint (default: `/mcp`)

### File Operations
- All file operations go through repositories
- Repositories use `fs-extra` for async operations
- Paths validated before any file system access

### Environment Configuration
- `MEMORY_BANK_ROOT`: Root directory for all memory banks (required)
- `SERVER_PORT`: HTTP server port (default: 3000)
- `SSE_ENDPOINT`: SSE endpoint path (default: `/mcp`)
- Loaded via `src/main/config/env.ts`

## Build Output

- Compiled JavaScript in `dist/` directory
- Executable: `dist/main/index.js`
- Binary name: `mcp-server-memory-bank`

## Docker Support

- Dockerfile included for containerized deployment
- Environment variables passed at runtime
- Volume mounting for memory bank root

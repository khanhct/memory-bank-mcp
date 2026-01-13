# Context Bank MCP Server

[![smithery badge](https://smithery.ai/badge/@alioshr/context-bank-mcp)](https://smithery.ai/server/@alioshr/context-bank-mcp)
[![npm version](https://badge.fury.io/js/%40allpepper%2Fcontext-bank-mcp.svg)](https://www.npmjs.com/package/@allpepper/context-bank-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@allpepper/context-bank-mcp.svg)](https://www.npmjs.com/package/@allpepper/context-bank-mcp)

<a href="https://glama.ai/mcp/servers/ir18x1tixp"><img width="380" height="200" src="https://glama.ai/mcp/servers/ir18x1tixp/badge" alt="Context Bank Server MCP server" /></a>

A Model Context Protocol (MCP) server implementation for remote context bank management, inspired by [Cline Memory Bank](https://github.com/nickbaumann98/cline_docs/blob/main/prompting/custom%20instructions%20library/cline-memory-bank.md).

## Overview

The Context Bank MCP Server transforms traditional file-based context banks into a centralized service that:

- Provides remote access to context bank files via MCP protocol over HTTP/SSE
- Enables multi-project context bank management
- Supports multiple team members connecting simultaneously via Server-Sent Events (SSE)
- Maintains consistent file structure and validation
- Ensures proper isolation between project context banks

## Features

- **Multi-Project Support**

  - Project-specific directories
  - File structure enforcement
  - Path traversal prevention
  - Project listing capabilities
  - File listing per project

- **Remote Accessibility**

  - Full MCP protocol implementation over HTTP/SSE
  - Server-Sent Events (SSE) for real-time connections
  - Multiple concurrent client connections supported
  - Type-safe operations
  - Proper error handling
  - Security through project isolation

- **Core Operations**
  - Read/write/update context bank files
  - List available projects
  - List files within projects
  - Project existence validation
  - Safe read-only operations

## Installation

To install Context Bank Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@alioshr/context-bank-mcp):

```bash
npx -y @smithery/cli install @alioshr/context-bank-mcp --client claude
```

This will set up the MCP server configuration automatically. Alternatively, you can configure the server manually as described in the Configuration section below.

## Quick Start

### Running the Server

1. Set environment variables:
   ```bash
   export CONTEXT_BANK_ROOT=/path/to/context-bank
   export SERVER_PORT=3000  # Optional, defaults to 3000
   export SSE_ENDPOINT=/mcp  # Optional, defaults to /mcp
   ```

2. Start the server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

3. The server will start on `http://localhost:3000/mcp` (or your configured port/endpoint)

### Connecting Clients

Configure your MCP client to connect to the HTTP/SSE endpoint (see Configuration section below)

## Using with Cline/Roo Code

The context bank MCP server needs to be configured in your Cline MCP settings file. The location depends on your setup:

- For Cline extension: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- For Roo Code VS Code extension: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json`

Add the following configuration to your MCP settings:

```json
{
  "allpepper-context-bank": {
    "command": "npx",
    "args": ["-y", "@allpepper/context-bank-mcp"],
    "env": {
      "CONTEXT_BANK_ROOT": "<path-to-bank>"
    },
    "disabled": false,
    "autoApprove": [
      "context_bank_read",
      "context_bank_write",
      "context_bank_update",
      "context_bank_retrieve",
      "list_projects",
      "list_project_files"
    ]
  }
}
```

### Configuration Details

**Server Environment Variables:**
- `CONTEXT_BANK_ROOT`: Directory where project context banks will be stored (e.g., `/path/to/context-bank`) - **Required** (falls back to `MEMORY_BANK_ROOT` for backward compatibility)
- `SERVER_PORT`: HTTP server port (default: `3000`) - Optional
- `SSE_ENDPOINT`: SSE endpoint path (default: `/mcp`) - Optional

**Client Configuration:**
- `disabled`: Set to `false` to enable the server
- `autoApprove`: List of operations that don't require explicit user approval:
  - `context_bank_read`: Read context bank files
  - `context_bank_write`: Create new context bank files
  - `context_bank_update`: Update existing context bank files
  - `context_bank_retrieve`: Retrieve context bank files to local workspace
  - `list_projects`: List available projects
  - `list_project_files`: List files within a project

## Using with Cursor

For Cursor, you can connect to a running SSE server:

1. Start the context bank server (see Quick Start above)
2. Configure Cursor to connect via HTTP:

```json
{
  "allpepper-context-bank": {
    "url": "http://localhost:3000/mcp",
    "type": "sse"
  }
}
```

Or run it directly (legacy stdio mode - for single user):

```shell
env CONTEXT_BANK_ROOT=<path-to-bank> npx -y @allpepper/context-bank-mcp@latest
```
## Using with Claude

- Claude desktop config file: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Claude Code config file:  `~/.claude.json`

1. Start the context bank server (see Quick Start above)
2. Locate the config file
3. Locate the property called `mcpServers`
4. Paste this (SSE/HTTP connection):

```json
{
  "allPepper-context-bank": {
    "type": "sse",
    "url": "http://localhost:3000/mcp",
    "env": {
      "CONTEXT_BANK_ROOT": "YOUR PATH"
    }
  }
}
```

Or use stdio mode (single user, legacy):

```json
{
  "allPepper-context-bank": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "-y",
      "@allpepper/context-bank-mcp@latest"
    ],
    "env": {
      "CONTEXT_BANK_ROOT": "YOUR PATH"
    }
  }
}
```

## Custom AI instructions

This section contains the instructions that should be pasted on the AI custom instructions, either for Cline, Claude or Cursor, or any other MCP client. You should copy and paste these rules. For reference, see [custom-instructions.md](custom-instructions.md) which contains these rules.

## Development

Basic development commands:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run the server directly with ts-node for quick testing
npm run dev
```

### Running with Docker

1. Build the Docker image:

    ```bash
    docker build -t context-bank-mcp:local .
    ```

2. Run the Docker container for testing:

    ```bash
    docker run -i --rm \
      -e CONTEXT_BANK_ROOT="/mnt/context_bank" \
      -v /path/to/context-bank:/mnt/context_bank \
      --entrypoint /bin/sh \
      context-bank-mcp:local \
      -c "ls -la /mnt/context_bank"
    ```

3. Add MCP configuration, example for Roo Code:

    ```json
    "allpepper-context-bank": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", 
        "CONTEXT_BANK_ROOT",
        "-v", 
        "/path/to/context-bank:/mnt/context_bank",
        "context-bank-mcp:local"
      ],
      "env": {
        "CONTEXT_BANK_ROOT": "/mnt/context_bank"
      },
      "disabled": false,
      "alwaysAllow": [
        "list_projects",
        "list_project_files",
        "context_bank_read",
        "context_bank_update",
        "context_bank_write",
        "context_bank_retrieve"
      ]
    }
    ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Maintain type safety across the codebase
- Add tests for new features
- Update documentation as needed
- Follow existing code style and patterns

### Testing

- Write unit tests for new features
- Include multi-project scenario tests
- Test error cases thoroughly
- Validate type constraints
- Mock filesystem operations appropriately

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project implements the context bank concept originally documented in the [Cline Memory Bank](https://github.com/nickbaumann98/cline_docs/blob/main/prompting/custom%20instructions%20library/cline-memory-bank.md), extending it with remote capabilities and multi-project support.

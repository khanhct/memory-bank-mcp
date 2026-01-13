# Product Context

## Why This Project Exists

AI assistants like Cline need persistent memory across sessions to maintain context about projects. Traditional memory banks are file-based and local, limiting their use in distributed or remote scenarios. This MCP server bridges that gap by providing remote access to memory banks.

## Problems It Solves

1. **Remote Access**: Enables AI assistants to access memory banks from anywhere
2. **Multi-Project Management**: Centralized management of multiple project memory banks
3. **Standardization**: Provides a consistent MCP interface for memory bank operations
4. **Isolation**: Ensures proper separation between different project memory banks

## How It Should Work

1. **Server Setup**: Configured via environment variable `MEMORY_BANK_ROOT`
2. **Project Isolation**: Each project has its own directory under the root
3. **File Operations**: Read, write, and update operations scoped to specific projects
4. **Listing**: Query available projects and their files
5. **Security**: All operations validated to prevent path traversal and ensure data integrity

## User Experience Goals

- **Simple Configuration**: Easy setup via MCP client configuration
- **Transparent Operations**: Operations work seamlessly through MCP protocol
- **Reliable Access**: Consistent and reliable file access
- **Error Clarity**: Clear error messages when operations fail
- **Auto-Approval**: Common operations can be auto-approved for smoother workflow

## Target Users

- AI assistants (Cline, Claude, Cursor)
- Developers using AI coding assistants
- Teams managing multiple project memory banks

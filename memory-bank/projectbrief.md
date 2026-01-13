# Project Brief

## Overview

Context MCP Server is a Model Context Protocol (MCP) server implementation that provides remote access to context files. It transforms traditional file-based context into a centralized service accessible via the MCP protocol.

## Core Purpose

Enable AI assistants (Cline, Claude, Cursor, etc.) to remotely manage and access project context across multiple projects through a standardized MCP interface.

## Key Requirements

1. **Multi-Project Support**
   - Isolated project directories
   - Project-specific file management
   - Path traversal prevention

2. **MCP Protocol Implementation**
   - Full MCP server compliance
   - Type-safe operations
   - Proper error handling

3. **Core Operations**
   - Read context files
   - Write new context files
   - Update existing context files
   - Retrieve context files to local workspace
   - List available projects
   - List files within projects

4. **Security & Validation**
   - Project isolation
   - Path security validation
   - Required field validation
   - Parameter name validation

## Success Criteria

- Successfully serve context files via MCP protocol
- Support multiple concurrent projects
- Maintain data integrity and security
- Provide reliable remote access for AI assistants
- Easy installation and configuration

## Project Scope

- MCP server implementation
- File system operations
- Project management
- Security validations
- Error handling
- Testing infrastructure

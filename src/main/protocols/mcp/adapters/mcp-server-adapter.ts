import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  Request as MCPRequest,
  ServerResult as MCPResponse,
} from "@modelcontextprotocol/sdk/types.js";
import * as http from "http";
import { HttpServerFactory } from "../../../factories/http-server-factory.js";
import { SSEServerTransport } from "./sse-server-transport.js";
import { McpRouterAdapter } from "./mcp-router-adapter.js";

export class McpServerAdapter {
  private server: Server | null = null;
  private httpServer: http.Server | null = null;
  private sseTransport: SSEServerTransport | null = null;

  constructor(
    private readonly mcpRouter: McpRouterAdapter,
    private readonly httpServerFactory: HttpServerFactory
  ) {}

  public register({ name, version }: { name: string; version: string }) {
    this.server = new Server(
      {
        name,
        version,
      },
      {
        capabilities: {
          tools: this.mcpRouter.getToolCapabilities(),
        },
      }
    );

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.mcpRouter.getToolsSchemas(),
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request: MCPRequest): Promise<MCPResponse> => {
        const { name } = request.params as { name: string };
        const handler = await this.mcpRouter.getToolHandler(name);
        if (!handler) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Tool ${name} not found`
          );
        }
        return await handler(request);
      }
    );
  }

  async start(): Promise<void> {
    if (!this.server) {
      throw new Error("Server not initialized");
    }

    // Create HTTP server
    this.httpServer = this.httpServerFactory.createServer();
    const port = this.httpServerFactory.getPort();
    const endpoint = this.httpServerFactory.getEndpoint();

    if (!this.httpServer) {
      throw new Error("Failed to create HTTP server");
    }

    // Create SSE transport
    this.sseTransport = new SSEServerTransport(this.httpServer, endpoint);

    // Set up request processor to handle MCP requests
    // We'll manually route to the handlers we registered
    this.sseTransport.setRequestProcessor(async (request: MCPRequest, requestId?: string | number | null) => {
      if (!this.server) {
        throw new Error("Server not initialized");
      }

      // Route requests to appropriate handlers
      // The Server class doesn't expose getRequestHandler, so we need to
      // manually check the method and call our registered handlers
      try {
        if (request.method === "tools/list") {
          const tools = this.mcpRouter.getToolsSchemas();
          return {
            jsonrpc: "2.0",
            id: requestId ?? null,
            result: {
              tools: tools.filter((tool): tool is NonNullable<typeof tool> => tool !== undefined),
            },
          };
        } else if (request.method === "tools/call") {
          const params = request.params as { name: string; arguments?: any };
          const { name } = params;
          const handler = await this.mcpRouter.getToolHandler(name);
          if (!handler) {
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool ${name} not found`
            );
          }
          // Create a proper MCP request with arguments
          const toolRequest: MCPRequest = {
            method: "tools/call",
            params: {
              name,
              arguments: params.arguments || {},
            },
          };
          const handlerResult = await handler(toolRequest);
          // The handler returns ServerResult with tools, isError, and content
          // We need to convert it to the proper MCP response format
          return {
            jsonrpc: "2.0",
            id: requestId ?? null,
            result: handlerResult,
          };
        } else if (request.method === "initialize") {
          // Handle MCP initialization
          return {
            jsonrpc: "2.0",
            id: requestId ?? null,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: "context-bank",
                version: "1.0.0",
              },
            },
          };
        }

        throw new McpError(
          ErrorCode.MethodNotFound,
          `Method ${request.method} not found`
        );
      } catch (error: unknown) {
        if (error instanceof McpError) {
          return {
            jsonrpc: "2.0",
            id: requestId ?? null,
            error: {
              code: error.code,
              message: error.message,
            },
          };
        }
        return {
          jsonrpc: "2.0",
          id: requestId ?? null,
          error: {
            code: ErrorCode.InternalError,
            message: error instanceof Error ? error.message : "Internal error",
          },
        };
      }
    });

    // Start HTTP server
    return new Promise((resolve, reject) => {
      if (!this.httpServer) {
        reject(new Error("HTTP server not created"));
        return;
      }

      this.httpServer.listen(port, () => {
        console.log(
          `Context Bank MCP server running on http://localhost:${port}${endpoint}`
        );
        console.log(`SSE endpoint: http://localhost:${port}${endpoint}`);
        resolve();
      });

      this.httpServer.on("error", (error: Error) => {
        console.error("HTTP server error:", error);
        reject(error);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.sseTransport) {
        this.sseTransport.close();
      }

      if (this.httpServer) {
        this.httpServer.close(() => {
          console.log("HTTP server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getConnectionCount(): number {
    return this.sseTransport?.getConnectionCount() || 0;
  }
}

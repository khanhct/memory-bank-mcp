import * as http from "http";
import {
  Request as MCPRequest,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

export interface SSETransportConnection {
  id: string;
  response: http.ServerResponse;
  request: http.IncomingMessage;
}

export type MCPRequestProcessor = (request: MCPRequest, requestId?: string | number | null) => Promise<any>;

export class SSEServerTransport {
  private connections: Map<string, SSETransportConnection> = new Map();
  private requestProcessor: MCPRequestProcessor | null = null;
  private httpServer: http.Server;
  private endpoint: string;

  constructor(httpServer: http.Server, endpoint: string = "/mcp") {
    this.httpServer = httpServer;
    this.endpoint = endpoint;
    this.setupHttpHandlers();
  }

  private setupHttpHandlers(): void {
    this.httpServer.on("request", async (req: http.IncomingMessage, res: http.ServerResponse) => {
      // Handle SSE connection
      if (req.method === "GET" && req.url === this.endpoint) {
        await this.handleSSEConnection(req, res);
        return;
      }

      // Handle POST requests (MCP protocol messages)
      if (req.method === "POST" && req.url === this.endpoint) {
        await this.handlePostRequest(req, res);
        return;
      }

      // Handle OPTIONS for CORS
      if (req.method === "OPTIONS") {
        this.handleCORS(res);
        res.writeHead(200);
        res.end();
        return;
      }

      // 404 for other routes
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });
  }

  private async handleSSEConnection(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const connectionId = this.generateConnectionId();

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    // Send initial connection event
    this.sendSSEEvent(res, "connected", { connectionId });

    // Store connection
    this.connections.set(connectionId, {
      id: connectionId,
      response: res,
      request: req,
    });

    // Handle client disconnect
    req.on("close", () => {
      this.connections.delete(connectionId);
      res.end();
    });

    // Keep connection alive with periodic ping
    const keepAliveInterval = setInterval(() => {
      if (!res.destroyed) {
        this.sendSSEEvent(res, "ping", { timestamp: Date.now() });
      } else {
        clearInterval(keepAliveInterval);
      }
    }, 30000); // Ping every 30 seconds

    req.on("close", () => {
      clearInterval(keepAliveInterval);
    });
  }

  private async handlePostRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    this.handleCORS(res);

    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const rawMessage = JSON.parse(body) as any;
        const message = rawMessage as MCPRequest;
        const requestId = rawMessage.id;

        // Log incoming request for debugging
        console.log("Received MCP request:", {
          method: message.method,
          id: requestId,
          hasParams: !!message.params,
        });

        // Process MCP protocol messages through the request processor
        if (this.requestProcessor) {
          const result = await this.requestProcessor(message, requestId);
          console.log("Sending MCP response:", {
            id: requestId,
            hasResult: !!result.result,
            hasError: !!result.error,
          });
          this.sendResponse(res, 200, result);
        } else {
          this.sendError(res, 503, "Request processor not initialized");
        }
      } catch (error) {
        const errorResponse = {
          jsonrpc: "2.0",
          id: (JSON.parse(body) as any)?.id || null,
          error: {
            code: ErrorCode.InternalError,
            message:
              error instanceof Error ? error.message : "Invalid request",
          },
        };
        this.sendResponse(res, 200, errorResponse);
      }
    });
  }

  private sendSSEEvent(
    res: http.ServerResponse,
    event: string,
    data: any
  ): void {
    if (res.destroyed) return;
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  private sendResponse(
    res: http.ServerResponse,
    statusCode: number,
    data: any
  ): void {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end(JSON.stringify(data));
  }

  private sendError(
    res: http.ServerResponse,
    statusCode: number,
    message: string
  ): void {
    this.sendResponse(res, statusCode, { error: message });
  }

  private handleCORS(res: http.ServerResponse): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setRequestProcessor(processor: MCPRequestProcessor): void {
    this.requestProcessor = processor;
  }

  public async sendToAll(event: string, data: any): Promise<void> {
    for (const connection of this.connections.values()) {
      if (!connection.response.destroyed) {
        this.sendSSEEvent(connection.response, event, data);
      }
    }
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }

  public async close(): Promise<void> {
    // Close all SSE connections
    for (const connection of this.connections.values()) {
      if (!connection.response.destroyed) {
        connection.response.end();
      }
    }
    this.connections.clear();
  }
}

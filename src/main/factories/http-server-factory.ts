import * as http from "http";
import { env } from "../config/env.js";

export interface HttpServerFactory {
  createServer(): http.Server;
  getPort(): number;
  getEndpoint(): string;
}

export class NodeHttpServerFactory implements HttpServerFactory {
  constructor(
    private readonly port: number = env.serverPort,
    private readonly endpoint: string = env.sseEndpoint
  ) {}

  createServer(): http.Server {
    const server = http.createServer();
    return server;
  }

  getPort(): number {
    return this.port;
  }

  getEndpoint(): string {
    return this.endpoint;
  }
}

import { McpServerAdapter } from "./adapters/mcp-server-adapter.js";
import { NodeHttpServerFactory } from "../../factories/http-server-factory.js";
import routes from "./routes.js";

const router = routes();
const httpServerFactory = new NodeHttpServerFactory();
const app = new McpServerAdapter(router, httpServerFactory);

app.register({
  name: "context-bank",
  version: "1.0.0",
});

export default app;

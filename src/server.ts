import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupMcpServer } from "./lib/nodes/fullLocal.ts";

const { server } = setupMcpServer();
await server.connect(new StdioServerTransport());

import { mcpServer } from "../mcpServer.ts";

// All modules containing nodes.
import "./coreNodes.ts";
import "./jsonSchemaNodes.ts";
import "./databaseNodes.ts";
import "./databaseSqliteNodes.ts";
import "./aiGenerationNodes.ts";
import "./proceduralAudioNodes.ts";

export function setupMcpServer() {
  return { server: mcpServer };
}

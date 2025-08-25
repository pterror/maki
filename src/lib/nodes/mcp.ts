import {
  McpServer,
  type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest,
  Tool,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import {
  toJSONSchema,
  type z,
  type ZodObject,
  type ZodRawShape,
  type ZodType,
} from "zod/v4";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { objectOutputType } from "zod/v3";
import type { JSONSchema } from "zod/v4/core";
import { upsertBaklavaType } from "./baklava";
import { unsafeValues } from "../core";
import { defineNode, Editor } from "baklavajs";
import { kebabCaseToPascalCase } from "../string";
import { allEditorsNeedingDerivedNodes } from "./core";
import {
  MemoryClientTransport,
  MemoryServerTransport,
} from "./memoryTransport";
import { zodShape } from "./zodHelpers";

export type McpToolConfig = {
  title?: string;
  description?: string;
  inputSchema?: ZodObject;
  outputSchema?: ZodObject;
  annotations?: ToolAnnotations;
};

const EMPTY_OBJECT_JSON_SCHEMA = { type: "object", properties: {} };

const mcpServer = new McpServer({ name: "maki-server", version: "0.1.0" });
const serverTransport = new MemoryServerTransport();
export function initializeMcpServer() {
  mcpServer.connect(serverTransport);
}

export type ToolCallback<Args extends undefined | ZodRawShape = undefined> =
  Args extends ZodRawShape
    ? (
        // @ts-expect-error
        args: objectOutputType<Args, ZodType>,
        extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
      ) => CallToolResult | Promise<CallToolResult>
    : (
        extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
      ) => CallToolResult | Promise<CallToolResult>;

export function registerMcpServerTool<
  InputArgs extends ZodObject,
  OutputArgs extends ZodObject,
>(
  name: string,
  config: {
    title: string;
    description: string;
    inputSchema: InputArgs;
    outputSchema: OutputArgs;
    annotations: ToolAnnotations & { baklavaCategory: string };
  },
  cb: (
    args: z.infer<InputArgs>,
  ) => z.infer<OutputArgs> | Promise<z.infer<OutputArgs>>,
): RegisteredTool {
  return mcpServer.registerTool(
    name,
    {
      ...config,
      inputSchema: zodShape(config.inputSchema),
      outputSchema: zodShape(config.outputSchema),
    } as never,
    (args) => {
      const result = cb(args as never);
      if (result instanceof Promise) {
        return result.then<CallToolResult>((data) => ({
          content: [],
          structuredContent: data,
        }));
      }
      return {
        content: [],
        structuredContent: result,
      } satisfies CallToolResult;
    },
  );
}

export function getMcpServerTools(server: McpServer) {
  // @ts-expect-error We need to access a private property to list all registered tools.
  return server._registeredTools as Record<
    string,
    McpToolConfig & { enabled: boolean }
  >;
}

export function getMcpServerToolsJson(server: McpServer) {
  const tools = getMcpServerTools(server);
  return Object.entries(tools)
    .filter(([, tool]) => tool.enabled)
    .map(([name, tool]) => ({
      name,
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema
        ? toJSONSchema(tool.inputSchema)
        : EMPTY_OBJECT_JSON_SCHEMA,
      ...(tool.outputSchema && {
        outputSchema: toJSONSchema(tool.outputSchema),
      }),
    }));
}

export async function mcpClientListAllTools(
  mcpClient: Client,
): Promise<readonly Tool[]> {
  let tools: Tool[] = [];
  let page = await mcpClient.listTools({});
  tools.push(...page.tools);
  while (page.nextCursor) {
    page = await mcpClient.listTools({ cursor: page.nextCursor });
    tools.push(...page.tools);
  }
  return tools;
}

const mcpClient = new Client({ name: "maki-client", version: "0.1.0" });

export async function registerAllToolsInBaklava() {
  const tools = await mcpClientListAllTools(mcpClient);
  for (const tool of tools) {
    if (tool.inputSchema.properties) {
      for (const property of unsafeValues(tool.inputSchema.properties)) {
        if (typeof property === "boolean") continue;
        upsertBaklavaType(property as JSONSchema.JSONSchema);
      }
    }
    if (tool.outputSchema?.properties) {
      for (const property of unsafeValues(tool.outputSchema.properties)) {
        if (typeof property === "boolean") continue;
        upsertBaklavaType(property as JSONSchema.JSONSchema);
      }
    }
    const ToolNode = defineNode({
      title: tool.title,
      type: `${kebabCaseToPascalCase(tool.name)}Node`,
    });
    function registerToolNode(editor: Editor) {
      editor.registerNodeType(ToolNode, {
        category: tool.annotations?.baklavaCategory as string | undefined,
      });
    }
    for (const editor of allEditorsNeedingDerivedNodes) {
      const editorInstance = editor.deref();
      if (!editorInstance) continue;
      registerToolNode(editorInstance);
    }
  }
}

export function initializeMcpClient() {
  mcpClient.connect(new MemoryClientTransport(serverTransport));
}

import {
  McpServer,
  type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import {
  toJSONSchema,
  z,
  type ZodObject,
  type ZodRawShape,
  type ZodType,
} from "zod/v4";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { objectOutputType } from "zod/v3";
import { zodShape } from "./nodes/zodHelpers.ts";

export type McpToolConfig = {
  title?: string;
  description?: string;
  inputSchema?: ZodObject;
  outputSchema?: ZodObject;
  annotations?: ToolAnnotations;
};

const EMPTY_OBJECT_JSON_SCHEMA = { type: "object", properties: {} };
export const token = Symbol("Generic node event token");

export const mcpServer = new McpServer({
  name: "maki-server",
  version: "0.1.0",
});

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

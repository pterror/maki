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
  z,
  type ZodObject,
  type ZodRawShape,
  type ZodType,
} from "zod/v4";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { objectOutputType } from "zod/v3";
import type { JSONSchema } from "zod/v4/core";
import {
  jsonSchemaToNodeInterface,
  jsonSchemaToOutputNodeInterface,
  upsertBaklavaType,
} from "./baklava";
import { unsafeValues } from "../core";
import {
  defineDynamicNode,
  defineNode,
  Editor,
  NodeInterfaceType,
  type INodeDefinition,
} from "baklavajs";
import { kebabCaseToPascalCase } from "../string";
import {
  MemoryClientTransport,
  MemoryServerTransport,
} from "./memoryTransport";
import { zodShape } from "./zodHelpers";
import { allEditorsNeedingDerivedNodes } from "./derivedNodes";
import {
  doesSchemaContainGeneric,
  extractGenericTypesFromSchema,
  substituteGenericTypesIntoSchema,
} from "../jsonSchema";
import { toRaw } from "vue";

export type McpToolConfig = {
  title?: string;
  description?: string;
  inputSchema?: ZodObject;
  outputSchema?: ZodObject;
  annotations?: ToolAnnotations;
};

const EMPTY_OBJECT_JSON_SCHEMA = { type: "object", properties: {} };
const token = Symbol("Generic node event token");

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
    const isGeneric = doesSchemaContainGeneric(
      tool.inputSchema as JSONSchema._JSONSchema,
    );
    const commonNodeConfig = {
      title: tool.title,
      type: `${kebabCaseToPascalCase(tool.name)}Node`,
      inputs: Object.fromEntries(
        Object.entries(tool.inputSchema.properties ?? {}).map(
          ([key, schema]) => [
            key,
            () =>
              jsonSchemaToNodeInterface(key, schema as JSONSchema._JSONSchema),
          ],
        ),
      ) as never,
      outputs: Object.fromEntries(
        Object.entries(tool.outputSchema?.properties ?? {}).map(
          ([key, schema]) => [
            key,
            () =>
              jsonSchemaToOutputNodeInterface(
                key,
                schema as JSONSchema._JSONSchema,
              ),
          ],
        ),
      ) as never,
      async calculate(inputs) {
        for (const k in inputs as object) {
          const v = (inputs as any)[k];
          if (v !== undefined) continue;
          if (tool.inputSchema.required?.includes(k)) return null;
        }
        const result = await mcpClient.callTool({
          name: tool.name,
          arguments: inputs as never,
        });
        return result.structuredContent;
      },
    } satisfies INodeDefinition<unknown, unknown>;
    const ToolNode = isGeneric
      ? defineDynamicNode({
          ...commonNodeConfig,
          inputs: {},
          outputs: {},
          onPlaced() {
            const updateInterfaces = () => {
              const connections = this.graph?.connections;
              // If there are no connections, we can't infer any concrete types,
              // so just return the original schemas.
              // This is a shortcut to avoid doing unnecessary work.
              if (!connections || connections.length === 0) {
                return {
                  inputs: Object.fromEntries(
                    Object.entries(tool.inputSchema.properties ?? {}).map(
                      ([key, schema]) => [
                        key,
                        () =>
                          jsonSchemaToNodeInterface(
                            key,
                            schema as JSONSchema._JSONSchema,
                          ),
                      ],
                    ),
                  ) as never,
                  outputs: Object.fromEntries(
                    Object.entries(tool.outputSchema?.properties ?? {}).map(
                      ([key, schema]) => [
                        key,
                        () =>
                          jsonSchemaToOutputNodeInterface(
                            key,
                            schema as JSONSchema._JSONSchema,
                          ),
                      ],
                    ),
                  ) as never,
                };
              }
              // @ts-expect-error We are intentionally accessing a private property.
              const interfaceTypes = toRaw(this.graph?.interfaceTypes.types) as
                | Map<string, NodeInterfaceType<any>>
                | undefined;
              const concreteInputs = {
                type: "object",
                properties: Object.fromEntries(
                  Object.entries(this.inputs).map(([k, v]) => {
                    const typeName = connections.find((c) => c.to === v)?.from
                      .type;
                    const type = typeName
                      ? interfaceTypes?.get(typeName)?.schema
                      : undefined;
                    return [
                      k,
                      // The `!`s are safe because the input schema is guaranteed to have `properties`,
                      // and is guaranteed to have a property for every input
                      // (because the node was created from the schema).
                      type ?? tool.inputSchema.properties![k]!,
                    ];
                  }),
                ),
              };
              const concreteOutputs = {
                type: "object",
                properties: Object.fromEntries(
                  Object.entries(this.outputs).map(([k, v]) => {
                    const typeName = connections.find((c) => c.to === v)?.from
                      .type;
                    const type = typeName
                      ? interfaceTypes?.get(typeName)?.schema
                      : undefined;
                    return [
                      k,
                      // The `!`s are safe because the output schema is guaranteed to have `properties`,
                      // and is guaranteed to have a property for every output
                      // (because the node was created from the schema).
                      type ?? tool.outputSchema!.properties![k]!,
                    ];
                  }),
                ),
              };
              // Extract from outputs first, since inputs should take precedence
              // (e.g. if both input and output are generic `T`, and input is
              // connected to `string`, then `T = string`).
              const genericParameters = extractGenericTypesFromSchema(
                tool.outputSchema as JSONSchema._JSONSchema,
                concreteOutputs as JSONSchema._JSONSchema,
              );
              extractGenericTypesFromSchema(
                tool.inputSchema as JSONSchema._JSONSchema,
                concreteInputs as JSONSchema._JSONSchema,
                genericParameters,
              );
              const filledInputs = substituteGenericTypesIntoSchema(
                tool.inputSchema as JSONSchema.JSONSchema,
                genericParameters,
              ) as JSONSchema.JSONSchema;
              const filledOutputs = substituteGenericTypesIntoSchema(
                tool.outputSchema as JSONSchema.JSONSchema,
                genericParameters,
              ) as JSONSchema.JSONSchema;
              console.log(
                ":)",
                connections,
                genericParameters,
                concreteInputs,
                concreteOutputs,
                filledInputs.properties,
                filledOutputs.properties,
              );
              for (const key in filledInputs.properties!) {
                const input = this.inputs[key];
                if (!input) continue;
                const schema = filledInputs.properties![key];
                if (schema === undefined || typeof schema === "boolean")
                  continue;
                const intf = jsonSchemaToNodeInterface(
                  key,
                  schema as JSONSchema._JSONSchema,
                );
                input.type = intf.type;
                Object.setPrototypeOf(input, Object.getPrototypeOf(intf));
              }
              for (const key in filledOutputs.properties!) {
                const output = this.outputs[key];
                if (!output) continue;
                const schema = filledOutputs.properties![key];
                if (schema === undefined || typeof schema === "boolean")
                  continue;
                const intf = jsonSchemaToOutputNodeInterface(
                  key,
                  schema as JSONSchema._JSONSchema,
                );
                output.type = intf.type;
                Object.setPrototypeOf(output, Object.getPrototypeOf(intf));
              }
            };
            this.graph!.events.addConnection.subscribe(token, updateInterfaces);
            this.graph!.events.removeConnection.subscribe(
              token,
              updateInterfaces,
            );
          },
          onUpdate() {
            return {
              inputs: commonNodeConfig.inputs,
              outputs: commonNodeConfig.outputs,
            };
          },
        })
      : defineNode(commonNodeConfig);
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

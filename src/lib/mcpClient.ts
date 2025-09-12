import { Client } from "@modelcontextprotocol/sdk/client";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  type INodeDefinition,
  defineDynamicNode,
  defineNode,
  Editor,
  NodeInterfaceType,
} from "baklavajs";
import { toRaw } from "vue";
import { unsafeValues } from "./core.ts";
import {
  doesSchemaContainGeneric,
  extractGenericTypesFromSchema,
  substituteGenericTypesIntoSchema,
} from "./jsonSchema.ts";
import { token } from "./mcpServer.ts";
import {
  upsertBaklavaType,
  jsonSchemaToNodeInterface,
  jsonSchemaToOutputNodeInterface,
} from "./nodes/baklava.ts";
import { allEditorsNeedingDerivedNodes } from "./nodes/allEditorsNeedingDerivedNodes.ts";
import { kebabCaseToPascalCase } from "./string.ts";
import type { JSONSchema } from "zod/v4/core";

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

export async function registerAllToolsInBaklava(mcpClient: Client) {
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
          if (tool.inputSchema.required?.includes(k)) {
            const keys = Object.keys(tool.outputSchema?.properties ?? {});
            return Object.fromEntries(keys.map((k) => [k, null]));
          }
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
              // @ts-expect-error We are intentionally accessing a private property.
              const interfaceTypes = toRaw(this.graph?.interfaceTypes.types) as
                | Map<string, NodeInterfaceType<any>>
                | undefined;
              const concreteInputs = {
                type: "object",
                properties: Object.fromEntries(
                  Object.entries(this.inputs).map(([k, v]) => {
                    const typeName = connections?.find((c) => c.to === v)?.from
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
                    const typeName = connections?.find((c) => c.to === v)?.from
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

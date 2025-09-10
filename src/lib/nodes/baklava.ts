import {
  defineNode,
  Editor,
  NodeInterface,
  type NodeInterfaceType,
} from "baklavajs";
import type { JSONSchema } from "zod/v4/core";
import {
  allInterfaceTypesRegistriesNeedingDerivedTypes,
  booleanType,
  checkboxInterface,
  integerInterface,
  integerType,
  listType,
  nodeInterface,
  nodeInterfaceType,
  numberInterface,
  numberType,
  selectInterface,
  stringDictType,
  stringType,
  textInputInterface,
  textInterface,
  unknownType,
} from "./interfaceTypes.ts";
import { unsafeEntries } from "../core.ts";
import { camelCaseToPascalCase, camelCaseToTitleCase } from "../string.ts";
import { normalizeJsonSchema, toNormalizedJsonSchema } from "./zodHelpers.ts";
import type { z, ZodType } from "zod/v4";
import { allEditorsNeedingDerivedNodes } from "./allEditorsNeedingDerivedNodes.ts";

export const coreTypeNames = new Set<string>();
const interfaceTypesById = new Map<string, NodeInterfaceType<any>>();

export function registerCoreType<T extends ZodType>(type: T, name: string) {
  const jsonSchema = toNormalizedJsonSchema(type);
  const id = JSON.stringify(jsonSchema);
  const interfaceType = nodeInterfaceType<z.infer<T>>(name, jsonSchema);
  coreTypeNames.add(name);
  interfaceTypesById.set(id, interfaceType);
  return interfaceType;
}

export function nodeInterfaceTypeToNodeInterface(
  key: string,
  value: NodeInterfaceType<any>,
): NodeInterface<any> {
  if (value === stringType) {
    return textInputInterface(key);
  } else if (value === integerType) {
    return integerInterface(key);
  } else if (value === numberType) {
    return numberInterface(key);
  } else if (value === booleanType) {
    return checkboxInterface(key);
  }
  return nodeInterface(key, value);
}

export function jsonSchemaToNodeInterface(
  key: string,
  value: JSONSchema._JSONSchema,
) {
  if (typeof value === "boolean") {
    return nodeInterface(key, unknownType) as NodeInterface<any>;
  }
  switch (value.type) {
    case "boolean": {
      return checkboxInterface(key);
    }
    case "string": {
      if (value.enum) {
        return selectInterface(
          key,
          upsertBaklavaType(value),
          value.enum.map((value) => ({ text: String(value), value })),
        );
      }
      return textInputInterface(key);
    }
    case "integer": {
      return integerInterface(key);
    }
    case "number": {
      return numberInterface(key);
    }
  }
  return nodeInterface(key, upsertBaklavaType(value));
}

export function jsonSchemaToOutputNodeInterface(
  key: string,
  value: JSONSchema._JSONSchema,
) {
  if (typeof value === "boolean") {
    return nodeInterface(key, unknownType) as NodeInterface<any>;
  }
  switch (value.type) {
    case "string": {
      if (value.format === "text-display") {
        return textInterface(key);
      }
    }
  }
  return nodeInterface(key, upsertBaklavaType(value));
}

export function upsertBaklavaType(
  type: JSONSchema.JSONSchema,
): NodeInterfaceType<unknown> {
  const jsonSchema = normalizeJsonSchema(structuredClone(type));
  const id = JSON.stringify(jsonSchema);
  const existing = interfaceTypesById.get(id);
  if (existing) return existing;
  const typeName =
    type.title ??
    type.$ref ??
    (() => {
      const itemType = Array.isArray(type.items)
        ? undefined
        : (type.items ?? type.additionalItems);
      if (type.type === "array" && typeof itemType === "object") {
        return `list[${upsertBaklavaType(itemType).name}]`;
      }
      if (
        type.type === "object" &&
        typeof type.additionalProperties === "object"
      ) {
        return `stringDict[${upsertBaklavaType(type.additionalProperties).name}]`;
      }
      if (type.type !== "object" && type.type !== "array") {
        // It is a primitive, its base type will be close enough.
        return type.type;
      }
    })();
  if (typeName === undefined) {
    console.error("Issue with type:", type, `(id: ${id})`);
    throw new Error("This Zod type is missing a name.");
  }
  const interfaceType = nodeInterfaceType(typeName, jsonSchema);
  interfaceTypesById.set(id, interfaceType);
  for (const typesRef of allInterfaceTypesRegistriesNeedingDerivedTypes) {
    const types = typesRef.deref();
    if (!types) continue;
    types.addTypes(interfaceType);
  }
  switch (type.type) {
    case "array": {
      if (!type.items || !Array.isArray(type.items)) {
        const itemsSchema = Array.isArray(type.items)
          ? type.additionalItems
          : type.items;
        if (itemsSchema) {
          const actualInterfaceType = listType(
            typeof itemsSchema === "object"
              ? upsertBaklavaType(itemsSchema)
              : unknownType,
          );
          interfaceTypesById.set(id, actualInterfaceType);
        }
        break;
      }
      const typeItems = type.items;
      const ConstructNode = defineNode({
        type: `Construct${camelCaseToPascalCase(typeName)}Node`,
        inputs: Object.fromEntries(
          type.items.map((schema, index) => [
            `item${index + 1}`,
            () => jsonSchemaToNodeInterface(`Item ${index + 1}`, schema),
          ]),
        ),
        outputs: {
          value: () => nodeInterface("Value", interfaceType),
        },
        calculate(inputs) {
          return {
            value: typeItems.map(
              (_, index) => (inputs as any)[`item${index + 1}`],
            ) as never,
          };
        },
      });
      function registerConstructNode(editor: Editor) {
        editor.registerNodeType(ConstructNode, {
          title: typeName
            ? `Construct ${camelCaseToTitleCase(typeName)}`
            : "Construct",
          category: "Tuple Construction",
        });
      }
      const DeconstructNode = defineNode({
        type: `Deconstruct${camelCaseToPascalCase(typeName)}Node`,
        inputs: {
          value: () => nodeInterface("Value", interfaceType),
        },
        outputs: Object.fromEntries(
          typeItems.map((item, index) => [
            `item${index + 1}`,
            () =>
              nodeInterface(
                `Item ${index + 1}`,
                typeof item === "boolean"
                  ? unknownType
                  : upsertBaklavaType(item),
              ),
          ]),
        ),
        calculate(inputs) {
          return Object.fromEntries(
            typeItems.map((_, index) => [
              `item${index + 1}`,
              (inputs.value as readonly unknown[])[index],
            ]),
          );
        },
      });
      function registerDeconstructNode(editor: Editor) {
        editor.registerNodeType(DeconstructNode, {
          title: typeName
            ? `Deconstruct ${camelCaseToTitleCase(typeName)}`
            : "Deconstruct",
          category: "Tuple Construction",
        });
      }
      for (const editor of allEditorsNeedingDerivedNodes) {
        const editorInstance = editor.deref();
        if (!editorInstance) continue;
        registerConstructNode(editorInstance);
        registerDeconstructNode(editorInstance);
      }
    }
    case "object": {
      if (!type.properties) {
        if (type.additionalProperties) {
          if (type.additionalProperties === true) {
            const actualInterfaceType = stringDictType(unknownType);
            interfaceTypesById.set(id, actualInterfaceType);
          } else if (typeof type.additionalProperties === "object") {
            const actualInterfaceType = stringDictType(
              upsertBaklavaType(type.additionalProperties),
            );
            interfaceTypesById.set(id, actualInterfaceType);
          }
        }
        break;
      }
      const ConstructNode = defineNode({
        type: `Construct${camelCaseToPascalCase(typeName)}Node`,
        inputs: Object.fromEntries(
          unsafeEntries(type.properties).flatMap(([key, schema]) =>
            schema === false
              ? []
              : [
                  [
                    key,
                    () =>
                      jsonSchemaToNodeInterface(
                        camelCaseToTitleCase(key),
                        schema,
                      ),
                  ],
                ],
          ),
        ),
        outputs: {
          value: () => nodeInterface("Value", interfaceType),
        },
      });
      function registerConstructNode(editor: Editor) {
        editor.registerNodeType(ConstructNode, {
          title: typeName
            ? `Construct ${camelCaseToTitleCase(typeName)}`
            : "Construct",
          category: "Object Construction",
        });
      }
      const DeconstructNode = defineNode({
        type: `Deconstruct${camelCaseToPascalCase(typeName)}Node`,
        inputs: {
          value: () => nodeInterface("Value", interfaceType),
        },
        outputs: Object.fromEntries(
          unsafeEntries(type.properties).flatMap(([key, value]) =>
            value === false
              ? []
              : [
                  [
                    key,
                    () =>
                      nodeInterface(
                        camelCaseToTitleCase(key),
                        value === true ? unknownType : upsertBaklavaType(value),
                      ),
                  ],
                ],
          ),
        ),
      });
      function registerDeconstructNode(editor: Editor) {
        editor.registerNodeType(DeconstructNode, {
          title: typeName
            ? `Deconstruct ${camelCaseToTitleCase(typeName)}`
            : "Deconstruct",
          category: "Object Deconstruction",
        });
      }
      for (const editor of allEditorsNeedingDerivedNodes) {
        const editorInstance = editor.deref();
        if (!editorInstance) continue;
        registerConstructNode(editorInstance);
        registerDeconstructNode(editorInstance);
      }
    }
    case undefined: {
      if (type.allOf) {
        for (const subType of type.allOf) {
          upsertBaklavaType(subType);
        }
      }
      if (type.anyOf) {
        for (const subType of type.anyOf) {
          upsertBaklavaType(subType);
        }
      }
      break;
    }
  }
  return interfaceType;
}
